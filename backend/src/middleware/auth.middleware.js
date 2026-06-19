const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
    let token;

    try {
        // Check if token exists in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            next(); // ✅ This calls the next middleware/route handler
        } else {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token'
            });
        }
    } catch (error) {
        console.error('Auth Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};

module.exports = { protect };