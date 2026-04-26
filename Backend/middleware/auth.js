// ══════════════════════════════════════════
//   middleware/auth.js - JWT Verification
// ══════════════════════════════════════════

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Protected Route Middleware ──
const protect = async (req, res, next) => {
  try {
    // Token header se lo
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Login zaruri hai. Token nahi mila.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Token verify karo
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expire ho gaya. Dobara login karein.' });
      }
      return res.status(401).json({ error: 'Invalid token. Dobara login karein.' });
    }

    // User database se lo
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User nahi mila.' });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ error: 'Authentication mein kuch gadbad hui.' });
  }
};

// ── Token Generate Helper ──
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

module.exports = { protect, generateToken };
