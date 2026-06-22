const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

const getFrontendBaseUrl = (req) => {
    let frontendBase = process.env.FRONTEND_URL || 'https://farmerdirect.vercel.app';
    const origin = req.get('origin') || req.get('referer') || '';
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        const match = origin.match(/^https?:\/\/[^\/]+/);
        if (match) {
            frontendBase = match[0];
        } else {
            frontendBase = 'http://localhost:5173'; // Vite default dev port
        }
    }
    return frontendBase;
};

// Rate limiting specifically for resending verification email
const resendLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 3, // Limit each IP to 3 requests per 15 minutes
    message: { message: 'Too many resend verification requests. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Validate password: min 8 characters, at least one letter and one number
const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
};

// Validate email format
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role, phone, address, coordinates } = req.body;

        // Required fields check
        if (!name || !email || !password || !role || !phone) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        // Admin registration protection
        if (role === 'admin') {
            return res.status(400).json({ message: 'Public registration for admin role is prohibited.' });
        }

        // Email validation
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        // Password matching
        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        // Password strength validation
        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and contain both letters and numbers.' });
        }

        // Duplicate email prevention
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        // Create user
        const lastVerificationEmailSentAt = new Date();
        const user = await User.create({
            name,
            email,
            password,
            role,
            phone,
            address,
            location: {
                type: 'Point',
                coordinates: coordinates || [78.4867, 17.3850], // Lon, Lat
            },
            isEmailVerified: false,
            lastVerificationEmailSentAt
        });

        // Generate cryptographically secure JWT email verification token
        const verifyTokenRaw = jwt.sign(
            { 
                userId: user._id, 
                type: 'email_verification',
                sentAt: lastVerificationEmailSentAt.getTime()
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send email
        const frontendBase = getFrontendBaseUrl(req);
        const verificationLink = `${frontendBase}/verify-email?token=${verifyTokenRaw}`;
        
        let emailErrorOccurred = false;
        let emailErrorMessage = '';
        try {
            await sendEmail({
                to: user.email,
                subject: 'Verify your FarmerDirect Account 🌾',
                text: `Hello ${user.name},\n\nPlease verify your account by clicking the following link:\n${verificationLink}\n\nThis link will expire in 24 hours.`,
                html: `<h3>Hello ${user.name},</h3><p>Please verify your account by clicking the link below:</p><p><a href="${verificationLink}" style="padding: 10px 20px; background-color: #16A34A; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Account</a></p><p>Or copy this link to your browser: ${verificationLink}</p><p>This link will expire in 24 hours.</p>`
            });
        } catch (emailError) {
            console.error('📧 [SMTP ERROR] Failed to send registration verification email:', emailError.message);
            emailErrorOccurred = true;
            emailErrorMessage = emailError.message;
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: false,
            isVerified: user.isVerified,
            token: generateToken(user),
            emailError: emailErrorOccurred ? emailErrorMessage : null
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Blocked user verification
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account is blocked. Please contact administration.' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isVerified: user.isVerified,
            token: generateToken(user),
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            location: user.location,
            isEmailVerified: user.isEmailVerified,
            isVerified: user.isVerified,
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/verify-email/:token
// @desc    Verify user email using token
// @access  Public
router.post('/verify-email/:token', async (req, res) => {
    try {
        let decoded;
        try {
            decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(400).json({ message: 'Verification link expired. Request a new email.' });
            }
            return res.status(400).json({ message: 'Invalid email verification link. Please request a new one.' });
        }

        if (decoded.type !== 'email_verification') {
            return res.status(400).json({ message: 'Invalid verification token type.' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'This account has already been verified.' });
        }

        // Check token invalidation (sentAt must match User's lastVerificationEmailSentAt)
        if (!user.lastVerificationEmailSentAt || user.lastVerificationEmailSentAt.getTime() !== decoded.sentAt) {
            return res.status(400).json({ message: 'This verification link has been superseded by a newer link.' });
        }

        user.isEmailVerified = true;
        user.lastVerificationEmailSentAt = undefined; // invalidate single-use
        await user.save();

        res.json({ message: 'Email verified successfully. Your account is now fully active!' });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification link
// @access  Public
router.post('/resend-verification', resendLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email address is required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address.' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'This account has already been verified.' });
        }

        // Cooldown rate limiting check (60 seconds)
        const cooldown = 60 * 1000;
        if (user.lastVerificationEmailSentAt && (Date.now() - user.lastVerificationEmailSentAt) < cooldown) {
            const secondsLeft = Math.ceil((cooldown - (Date.now() - user.lastVerificationEmailSentAt)) / 1000);
            return res.status(429).json({ message: `Please wait ${secondsLeft} seconds before requesting another verification email.` });
        }

        // Generate JWT email verification token
        const lastVerificationEmailSentAt = new Date();
        const verifyTokenRaw = jwt.sign(
            { 
                userId: user._id, 
                type: 'email_verification',
                sentAt: lastVerificationEmailSentAt.getTime()
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        user.lastVerificationEmailSentAt = lastVerificationEmailSentAt;
        await user.save();

        // Send email
        const frontendBase = getFrontendBaseUrl(req);
        const verificationLink = `${frontendBase}/verify-email?token=${verifyTokenRaw}`;
        try {
            await sendEmail({
                to: user.email,
                subject: 'Verify your FarmerDirect Account 🌾',
                text: `Hello ${user.name},\n\nPlease verify your account by clicking the following link:\n${verificationLink}\n\nThis link will expire in 24 hours.`,
                html: `<h3>Hello ${user.name},</h3><p>Please verify your account by clicking the link below:</p><p><a href="${verificationLink}" style="padding: 10px 20px; background-color: #16A34A; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Account</a></p><p>Or copy this link to your browser: ${verificationLink}</p><p>This link will expire in 24 hours.</p>`
            });
            res.json({ message: 'We sent a verification email to your inbox.' });
        } catch (emailError) {
            console.error('📧 [SMTP ERROR] Failed to resend verification email:', emailError.message);
            res.status(500).json({ message: `Failed to send email: ${emailError.message}. Please check SMTP configuration.` });
        }
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: 'Unable to send email right now. Please try again later.' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset token
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email address is required.' });
        }

        const user = await User.findOne({ email });
        // Return a positive response to prevent account enumeration
        if (!user) {
            return res.json({ message: 'If this email exists in our records, a password reset link has been sent.' });
        }

        const resetTokenRaw = crypto.randomBytes(20).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetTokenRaw).digest('hex');
        const passwordResetExpires = Date.now() + 3600000; // 1 hour

        user.passwordResetToken = passwordResetToken;
        user.passwordResetExpires = passwordResetExpires;
        await user.save();

        const frontendBase = getFrontendBaseUrl(req);
        const resetLink = `${frontendBase}/reset-password/${resetTokenRaw}`;
        try {
            await sendEmail({
                to: user.email,
                subject: 'Reset your FarmerDirect Password 🔒',
                text: `Hello ${user.name},\n\nYou requested a password reset. Please click the following link to set a new password:\n${resetLink}\n\nIf you did not request this, please ignore this email. This link will expire in 1 hour.`,
                html: `<h3>Hello ${user.name},</h3><p>You requested a password reset. Please click the link below to set a new password:</p><p><a href="${resetLink}" style="padding: 10px 20px; background-color: #16A34A; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p><p>Or copy this link to your browser: ${resetLink}</p><p>This link will expire in 1 hour.</p><p>If you did not make this request, you can safely ignore this email.</p>`
            });
        } catch (emailError) {
            console.error('📧 [SMTP ERROR] Failed to send password reset email:', emailError.message);
        }

        res.json({ message: 'If this email exists in our records, a password reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired password reset link.' });
        }

        const { password, confirmPassword } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required.' });
        }

        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and contain both letters and numbers.' });
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully. You can now login.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change password (authenticated)
// @access  Private
router.put('/change-password', protect, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password.' });
        }

        const user = await User.findById(req.user._id).select('+password');
        if (!(await user.comparePassword(oldPassword))) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({ message: 'New password must be at least 8 characters long and contain both letters and numbers.' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update profile details
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone, street, city, state, zip, coordinates } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        
        user.address = user.address || {};
        if (street !== undefined) user.address.street = street;
        if (city !== undefined) user.address.city = city;
        if (state !== undefined) user.address.state = state;
        if (zip !== undefined) user.address.zip = zip;

        if (coordinates) {
            user.location = {
                type: 'Point',
                coordinates: coordinates // [longitude, latitude]
            };
        }

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            location: user.location,
            isEmailVerified: user.isEmailVerified,
            isVerified: user.isVerified,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
