const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

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
            isEmailVerified: true
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: true,
            isVerified: user.isVerified,
            token: generateToken(user)
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

// @route   POST /api/auth/forgot-password
// @desc    Directly reset password using Email and Phone verification
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, phone, newPassword, confirmPassword } = req.body;
        
        if (!email || !phone || !newPassword) {
            return res.status(400).json({ message: 'Please provide email, phone number, and new password.' });
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and contain both letters and numbers.' });
        }

        const user = await User.findOne({ email, phone });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or phone number.' });
        }

        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully. You can now login.' });
    } catch (error) {
        console.error('Direct forgot password error:', error);
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
