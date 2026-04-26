// ══════════════════════════════════════════════════
//   FolioCraft Backend — server.js
//   Main Entry Point
// ══════════════════════════════════════════════════

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/database');

// Routes
const authRoutes      = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const publicRoutes    = require('./routes/public');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// ── Database Connect ──
connectDB();

// ── Security Middleware ──
app.use(helmet());

// ── CORS ──
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5500',    // Live Server
    'http://127.0.0.1:5500',
    /\.vercel\.app$/,           // Koi bhi Vercel subdomain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ──
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,                    // 100 requests per window
  message: { error: 'Bahut zyada requests. Thodi der baad try karein.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                     // Login ke liye strict limit
  message: { error: 'Bahut zyada login attempts. 15 min baad try karein.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Body Parser ──
app.use(express.json({ limit: '10mb' }));        // Base64 images ke liye bada limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FolioCraft Backend chal raha hai!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// ── API Routes ──
app.use('/api/auth',      authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/public',    publicRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} nahi mili.` });
});

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Server mein kuch gadbad hui.'
      : err.message
  });
});

// ── Start Server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║     FolioCraft Backend Running!       ║
  ║     Port: ${PORT}                        ║
  ║     Env:  ${process.env.NODE_ENV || 'development'}                 ║
  ╚═══════════════════════════════════════╝
  `);
});

module.exports = app;
