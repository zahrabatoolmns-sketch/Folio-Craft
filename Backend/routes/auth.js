// ══════════════════════════════════════════════════
//   routes/auth.js - Register, Login, Profile
// ══════════════════════════════════════════════════

const express         = require('express');
const router          = express.Router();
const User            = require('../models/User');
const Portfolio       = require('../models/Portfolio');
const { protect, generateToken } = require('../middleware/auth');

// ─────────────────────────────────────────────
// POST /api/auth/register - Naya account banao
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Naam, email aur password zaruri hain.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimum 6 characters ka hona chahiye.' });
    }

    // Email already registered?
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Yeh email pehle se registered hai. Login karein.' });
    }

    // User banao
    const user = await User.create({ name, email, password });

    // Ek empty portfolio bhi banao is user ke liye
    await Portfolio.create({
      user: user._id,
      fullname: name,
      email: email
    });

    // Token generate karo
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account ban gaya! Welcome to FolioCraft.',
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Register Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Yeh email already use ho rahi hai.' });
    }
    res.status(500).json({ error: 'Registration mein kuch gadbad hui.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login - Login karo
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email aur password dono chahiye.' });
    }

    // User dhundo (password bhi include karo compare ke liye)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Email ya password galat hai.' });
    }

    // Password check karo
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email ya password galat hai.' });
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
    res.status(500).json({ error: 'Login mein kuch gadbad hui.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/me - Apna profile dekho
// ─────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Is user ki portfolio bhi lo
    const portfolio = await Portfolio.findOne({ user: req.user._id })
      .select('-views');    // Analytics data exclude karo

    res.json({
      success: true,
      user: user.toSafeObject(),
      portfolio: portfolio || null
    });

  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ error: 'Profile laane mein kuch gadbad hui.' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/auth/change-password - Password change
// ─────────────────────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Purana aur naya password dono chahiye.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Naya password minimum 6 characters ka hona chahiye.' });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Purana password galat hai.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password successfully change ho gaya!' });

  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ error: 'Password change mein kuch gadbad hui.' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/auth/delete-account - Account delete
// ─────────────────────────────────────────────
router.delete('/delete-account', protect, async (req, res) => {
  try {
    // Portfolio bhi delete karo
    await Portfolio.deleteMany({ user: req.user._id });
    // User delete karo
    await User.findByIdAndDelete(req.user._id);

    res.json({ success: true, message: 'Account successfully delete ho gaya.' });

  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ error: 'Account delete karne mein kuch gadbad hui.' });
  }
});

// ─────────────────────────────────────
// Google Login Routes — Serverless Fix
// ─────────────────────────────────────

// Step 1 — Google pe redirect karo
router.get('/google', (req, res) => {
  const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile`;

  res.redirect(googleAuthURL);
});

// Step 2 — Google callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);

    // Google se access token lo
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
      return res.redirect(`${process.env.FRONTEND_URL}?error=token_failed`);
    }

    // Google se user info lo
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const googleUser = await userRes.json();

    // Database mein dhundo ya banao
    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      user = await User.create({
        name:     googleUser.name,
        email:    googleUser.email,
        avatar:   googleUser.picture,
        password: 'google_' + googleUser.id,
        googleId: googleUser.id
      });

      // Naye user ke liye portfolio banao
      await Portfolio.create({
        user:     user._id,
        fullname: googleUser.name,
        email:    googleUser.email
      });
    }

    // JWT token banao
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Frontend pe redirect karo
    res.redirect(`${process.env.FRONTEND_URL}/index.html?token=${token}&name=${encodeURIComponent(user.name)}`);

  } catch (err) {
    console.error('Google auth error:', err);
    res.redirect(`${process.env.FRONTEND_URL}?error=server_error`);
  }
});
module.exports = router;
