const express = require('express');
const router = express.Router();
const UserModel = require('./userSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await UserModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new UserModel({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });

        res.status(201).json({ 
            message: 'User registered successfully', 
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });

        res.json({ 
            message: 'Login successful', 
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await UserModel.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
