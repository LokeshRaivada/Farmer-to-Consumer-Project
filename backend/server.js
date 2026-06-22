const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Notification = require('./models/Notification');
require('dotenv').config();
const dns = require('dns').promises;
const net = require('net');

const app = express();
const http = require('http').createServer(app);

// Security Headers via Helmet
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50,
    message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' }
});

// MongoDB query injection prevention middleware
app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else if (typeof obj[key] === 'object') {
                    sanitize(obj[key]);
                }
            }
        }
    };
    sanitize(req.body);
    sanitize(req.query);
    sanitize(req.params);
    next();
});

// HTML Tag/XSS stripping middleware
app.use((req, res, next) => {
    const sanitizeXss = (value) => {
        if (typeof value === 'string') {
            return value.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
                        .replace(/<\/?[^>]+(>|$)/g, ''); // strip HTML tags
        }
        if (value && typeof value === 'object') {
            for (const key in value) {
                value[key] = sanitizeXss(value[key]);
            }
        }
        return value;
    };
    if (req.body) {
        req.body = sanitizeXss(req.body);
    }
    next();
});

// Middleware Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://farmerdirect.vercel.app'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const io = require('socket.io')(http, { cors: corsOptions });
app.set('io', io);

// Map to track online users: Map<userId, socketId>
const onlineUsers = new Map();

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId && userId !== 'undefined') {
        onlineUsers.set(userId, socket.id);
        console.log(`User Connected: ${socket.id} (Registered user ID: ${userId})`);
    } else {
        console.log(`User Connected: ${socket.id} (Anonymous/Unregistered)`);
    }
    
    socket.on('join_room', async (data) => {
        const room = typeof data === 'string' ? data : data.room;
        if (!room) return;

        // If joining an order-based room, enforce authorization
        if (room.startsWith('chat_order_')) {
            const orderId = room.split('chat_order_')[1];
            try {
                const Order = require('./models/Order');
                const User = require('./models/User');
                const order = await Order.findById(orderId);
                
                if (!userId || userId === 'undefined') {
                    socket.emit('error_message', 'Authentication required to join this chat.');
                    return;
                }

                const user = await User.findById(userId);
                if (order && user) {
                    const isConsumer = order.consumer.toString() === user._id.toString();
                    const isFarmer = order.farmer.toString() === user._id.toString();
                    const isAdmin = user.role === 'admin';

                    if (isConsumer || isFarmer || isAdmin) {
                        socket.join(room);
                        console.log(`Authorized user ${userId} joined room: ${room}`);
                    } else {
                        console.warn(`Unauthorized join attempt to ${room} by user ${userId}`);
                        socket.emit('error_message', 'Unauthorized access to this chat room.');
                    }
                } else {
                    socket.emit('error_message', 'Order or User not found.');
                }
            } catch (err) {
                console.error('Socket join authorization error:', err);
                socket.emit('error_message', 'Internal server error during authorization.');
            }
        } else {
            socket.join(room);
            console.log(`User with ID: ${socket.id} joined general room: ${room}`);
        }
    });

    socket.on('send_message', async (data) => {
        if (data.orderId) {
            try {
                const Order = require('./models/Order');
                const order = await Order.findById(data.orderId);
                if (order) {
                    const isConsumer = order.consumer.toString() === data.senderId.toString();
                    const isFarmer = order.farmer.toString() === data.senderId.toString();

                    if (isConsumer || isFarmer) {
                        // Save message to database
                        const Message = require('./models/Message');
                        const msg = await Message.create({
                            sender: data.senderId,
                            receiver: data.receiverId,
                            content: data.text,
                            orderId: data.orderId,
                            isRead: false
                        });

                        data._id = msg._id;
                        data.createdAt = msg.createdAt;

                        // Broadcast message to room
                        socket.to(data.room).emit('receive_message', data);

                        // Trigger notifications via Helper
                        const notificationHelper = require('./utils/notificationHelper');
                        await notificationHelper.createNotification(app, {
                            recipient: data.receiverId,
                            sender: data.senderId,
                            type: 'message',
                            title: 'New Message 💬',
                            message: `New message from ${data.senderName || 'User'}: "${data.text}"`,
                            link: `/orders`
                        });
                    } else {
                        socket.emit('error_message', 'Forbidden: You cannot send messages to this order.');
                    }
                }
            } catch (err) {
                console.error('Socket message save/broadcast error:', err);
            }
        }
    });

    socket.on('update_location', (data) => {
        socket.to(data.room).emit('receive_location', data);
    });

    socket.on('disconnect', () => {
        if (userId) {
            onlineUsers.delete(userId);
            console.log(`User Disconnected: ${socket.id} (Deregistered user ID: ${userId})`);
        } else {
            console.log('User Disconnected', socket.id);
        }
    });
});

app.use(express.json({ limit: '10mb' })); // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/farmer', require('./routes/farmerRoutes'));
app.use('/api/consumer', require('./routes/consumerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/farmers', require('./routes/farmerPublicRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/config/public', (req, res) => {
    res.json({
        emailVerificationRequired: process.env.EMAIL_VERIFICATION_REQUIRED !== 'false',
        emailEnabled: process.env.EMAIL_ENABLED !== 'false',
        nodeEnv: process.env.NODE_ENV || 'development'
    });
});

app.get('/', (req, res) => {
    res.send('FarmerDirect MERN API is currently running.');
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Database Connection with optimized settings
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected securely to MongoDB Atlas');
        
        // Verify Nodemailer SMTP connectivity or Resend API key after successful DB connection
        const isEmailRequired = process.env.EMAIL_VERIFICATION_REQUIRED !== 'false';
        const emailEnabled = process.env.EMAIL_ENABLED !== 'false';
        if (emailEnabled) {
            if (process.env.RESEND_API_KEY) {
                console.log('📧 [Email] Resend API Key detected. Emails will be sent via HTTP API (Render Free Tier compatible).');
            } else if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const nodemailer = require('nodemailer');
                
                let host = process.env.EMAIL_HOST;
                let servername = undefined;
                if (host && !net.isIP(host)) {
                    try {
                        const lookup = await dns.lookup(host, { family: 4 });
                        servername = host;
                        host = lookup.address;
                        console.log(`ℹ️ [SMTP Check] Resolved ${process.env.EMAIL_HOST} to IPv4 ${host}`);
                    } catch (dnsErr) {
                        console.warn(`⚠️ [SMTP Check] DNS lookup failed for ${host}:`, dnsErr.message);
                    }
                }

                const transporter = nodemailer.createTransport({
                    host: host,
                    port: parseInt(process.env.EMAIL_PORT) || 587,
                    secure: process.env.EMAIL_SECURE === 'true',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    },
                    tls: servername ? { servername } : undefined,
                    connectionTimeout: 5000,
                    greetingTimeout: 5000,
                    socketTimeout: 5000
                });

                transporter.verify()
                    .then(() => console.log('📧 [SMTP] Connected and authenticated successfully to SMTP server'))
                    .catch((err) => {
                        console.error('❌ [SMTP] SMTP Connection Verification Failed:', err.message);
                        if (isEmailRequired) {
                            console.error('🚨 [SMTP] EMAIL_VERIFICATION_REQUIRED is true. Real emails will NOT work.');
                        }
                    });
            } else {
                console.warn('⚠️ [SMTP/Resend] Email configuration variables are missing. Real emails will not be sent.');
            }
        } else {
            console.log('ℹ️ [EMAIL] Email features are disabled globally (EMAIL_ENABLED=false). Using local sandboxed log fallback.');
        }
    })
    .catch((err) => console.error('MongoDB Connection Error:', err));

// Start Server
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    
    console.log('\n========= FarmerDirect Production Audit Checks =========');
    console.log(`MongoDB Connected: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`JWT Secret Loaded: ${process.env.JWT_SECRET ? '✅ YES' : '❌ NO'}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL || '❌ NOT SET'}`);
    
    const smtpConfigured = !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
    const resendConfigured = !!process.env.RESEND_API_KEY;
    if (resendConfigured) {
        console.log('Email Status: ✅ Configured (Resend HTTP API)');
    } else {
        console.log(`Email Status: ${smtpConfigured ? '✅ Configured (SMTP)' : '❌ Missing Config'}`);
    }
    
    const razorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    console.log(`Razorpay Status: ${razorpayConfigured ? '✅ Configured' : '❌ Missing Config'}`);
    console.log('========================================================\n');
});
