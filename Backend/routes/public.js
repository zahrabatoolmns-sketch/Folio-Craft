// routes/public.js - Public Portfolio View (no login needed)

const express   = require('express');
const router    = express.Router();
const Portfolio = require('../models/Portfolio');
const logger = require('../config/logger');

// GET /api/public/p/:shareId - Share link se portfolio dekho
router.get('/p/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;

    const portfolio = await Portfolio.findOne({
      shareId,
      isPublished: true    // Sirf published portfolios
    }).select('-views -user');   // Private data hide

    if (!portfolio) {
      return res.status(404).json({
        error: 'Portfolio not found or published.'
      });
    }

    // View record karo (background mein - response delay na ho)
    recordView(portfolio._id, req).catch(console.error);

    res.json({
      success: true,
      portfolio: portfolio.toPublicObject()
    });

  } catch (error) {
    logger.error('Public portfolio fetch failed', error.message);
    res.status(500).json({ error: 'something went wrong bringing portfolio.' });
  }
});

// GET /api/public/check/:shareId - Check karo portfolio exist karta hai
router.get('/check/:shareId', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      shareId: req.params.shareId,
      isPublished: true
    }).select('fullname title shareId');

    if (!portfolio) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      name: portfolio.fullname,
      title: portfolio.title
    });

  } catch (error) {
    res.status(500).json({ error: 'something went wrong to check.' });
  }
});

// ── Helper: View Record karo ──
async function recordView(portfolioId, req) {
  try {
    const portfolio = await Portfolio.findById(portfolioId);
    if (!portfolio) return;

    // User agent se device detect karo
    const ua = req.headers['user-agent'] || '';
    let device = 'desktop';
    if (/mobile/i.test(ua))  device = 'mobile';
    if (/tablet/i.test(ua))  device = 'tablet';

    await portfolio.recordView({
      date:     new Date(),
      device,
      referrer: req.headers.referer || req.headers.referrer || 'direct'
    });

  } catch (err) {
    // View record fail ho to koi baat nahi
    logger.warn('View record failed: ' + err.message);
  }
}

module.exports = router;
