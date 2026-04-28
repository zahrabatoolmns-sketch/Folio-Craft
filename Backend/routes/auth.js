// ══════════════════════════════════════════════════
//   routes/auth.js - Register, Login, Profile
// ══════════════════════════════════════════════════

const express         = require('express');
const router          = express.Router();
const User            = require('../models/User');
const Portfolio       = require('../models/Portfolio');
const crypto          = require('crypto');
const { protect, generateToken } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../config/email');

const FRONTEND_URL = 'https://folio-craft-6frg.vercel.app';

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered. Please login.' });
    }

    const user = await User.create({ name, email, password });

    await Portfolio.create({
      user: user._id,
      fullname: name,
      email: email
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created! Welcome to FolioCraft.',
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Register Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This email is already in use.' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const portfolio = await Portfolio.findOne({ user: req.user._id })
      .select('-views');

    res.json({
      success: true,
      user: user.toSafeObject(),
      portfolio: portfolio || null
    });

  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/auth/change-password
// ─────────────────────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully!' });

  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/auth/delete-account
// ─────────────────────────────────────────────
router.delete('/delete-account', protect, async (req, res) => {
  try {
    await Portfolio.deleteMany({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);

    res.json({ success: true, message: 'Account deleted successfully.' });

  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/google
// ─────────────────────────────────────────────
router.get('/google', (req, res) => {
  const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile`;

  res.redirect(googleAuthURL);
});

// ─────────────────────────────────────────────
// GET /api/auth/google/callback
// ─────────────────────────────────────────────
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect(`${FRONTEND_URL}?error=no_code`);

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  process.env.GOOGLE_CALLBACK_URL,
        grant_type:    'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.redirect(`${FRONTEND_URL}?error=token_failed`);
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const googleUser = await userRes.json();

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      user = await User.create({
        name:     googleUser.name,
        email:    googleUser.email,
        avatar:   googleUser.picture,
        password: 'google_' + googleUser.id,
        googleId: googleUser.id
      });

      await Portfolio.create({
        user:     user._id,
        fullname: googleUser.name,
        email:    googleUser.email
      });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.redirect(`${FRONTEND_URL}/index.html?token=${token}&name=${encodeURIComponent(user.name)}`);

  } catch (err) {
    console.error('Google auth error:', err);
    res.redirect(`${FRONTEND_URL}?error=server_error`);
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        success: true,
        message: 'If this email is registered, a reset link has been sent.'
      });
    }

    const resetToken  = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 60 * 60 * 1000;

    user.resetPasswordToken   = resetToken;
    user.resetPasswordExpires = tokenExpiry;
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken, user.name);

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email.'
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Failed to send reset email. Please try again.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({
      resetPasswordToken:   token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Reset link has expired or is invalid. Please try again.'
      });
    }

    user.password             = newPassword;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now login.'
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

module.exports = router;