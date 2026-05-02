const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

// ── Protected Route Middleware ──
const protect = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Login required, token not found.'
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session has expired, please login again.' });
      }
      return res.status(401).json({ error: 'Invalid token. please login again.' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = user;
    next();

  } catch (error) {
    logger.error('Auth middleware error', error.message);
    res.status(500).json({ error: 'Something wrong with authentication.' });
  }
};

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

module.exports = { protect, generateToken };
