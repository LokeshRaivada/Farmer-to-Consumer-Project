const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Notification = require('./models/Notification');
require('dotenv').config();

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

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);
    
    socket.on('join_room', (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    socket.on('send_message', async (data) => {
        socket.to(data.room).emit('receive_message', data);
        
        if (data.receiverId) {
            try {
                await Notification.create({
                    recipient: data.receiverId,
                    sender: data.senderId,
                    type: 'message_received',
                    title: 'New Message 💬',
                    message: `New message from ${data.senderName || 'Farmer'}: "${data.text}"`,
                    link: '/orders'
                });
            } catch (err) {
                console.error('Socket message notification save error:', err);
            }
        }
    });

    socket.on('update_location', (data) => {
        // Broadcast location updates to specific room (e.g., order ID or user ID)
        socket.to(data.room).emit('receive_location', data);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
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

app.get('/api/config/public', (req, res) => {
    res.json({
        emailVerificationRequired: process.env.EMAIL_VERIFICATION_REQUIRED !== 'false',
        emailEnabled: process.env.EMAIL_ENABLED !== 'false'
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
    .then(() => {
        console.log('Connected securely to MongoDB Atlas');
        
        // Verify Nodemailer SMTP connectivity after successful DB connection
        const isEmailRequired = process.env.EMAIL_VERIFICATION_REQUIRED !== 'false';
        const emailEnabled = process.env.EMAIL_ENABLED !== 'false';
        if (emailEnabled) {
            if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const nodemailer = require('nodemailer');
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: parseInt(process.env.EMAIL_PORT) || 587,
                    secure: process.env.EMAIL_SECURE === 'true',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    },
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
                console.warn('⚠️ [SMTP] SMTP configuration variables are missing. Real emails will not be sent.');
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
});
