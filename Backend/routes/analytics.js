// ══════════════════════════════════════════════════════
//   routes/analytics.js - Portfolio Views & Stats
// ══════════════════════════════════════════════════════

const express   = require('express');
const router    = express.Router();
const Portfolio = require('../models/Portfolio');
const { protect } = require('../middleware/auth');

router.use(protect);

// ─────────────────────────────────────────────────────
// GET /api/analytics/overview - Dashboard summary
// ─────────────────────────────────────────────────────
router.get('/overview', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio) {
      return res.json({
        success: true,
        stats: {
          totalViews: 0,
          last7Days: 0,
          last30Days: 0,
          deviceBreakdown: {},
          topReferrers: [],
          dailyViews: []
        }
      });
    }

    const now      = new Date();
    const last7    = new Date(now - 7  * 24 * 60 * 60 * 1000);
    const last30   = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const views = portfolio.views || [];

    // Last 7 days views
    const last7Days = views.filter(v => new Date(v.date) > last7).length;

    // Last 30 days views
    const last30Days = views.filter(v => new Date(v.date) > last30).length;

    // Device breakdown
    const deviceBreakdown = views.reduce((acc, v) => {
      const d = v.device || 'unknown';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    // Top referrers
    const referrerMap = views.reduce((acc, v) => {
      const r = v.referrer || 'direct';
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});

    const topReferrers = Object.entries(referrerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    // Daily views for last 30 days (chart ke liye)
    const dailyViews = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = views.filter(v => {
        const vDate = new Date(v.date);
        return vDate >= dayStart && vDate <= dayEnd;
      }).length;

      dailyViews.push({
        date:  dayStart.toISOString().split('T')[0],
        views: count
      });
    }

    res.json({
      success: true,
      stats: {
        totalViews:      portfolio.totalViews || 0,
        last7Days,
        last30Days,
        deviceBreakdown,
        topReferrers,
        dailyViews,
        isPublished:     portfolio.isPublished,
        shareUrl:        portfolio.isPublished
          ? `${process.env.APP_BASE_URL}/p/${portfolio.shareId}`
          : null
      }
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Analytics laane mein kuch gadbad hui.' });
  }
});

// ─────────────────────────────────────────────────────
// DELETE /api/analytics/reset - Analytics reset karo
// ─────────────────────────────────────────────────────
router.delete('/reset', async (req, res) => {
  try {
    await Portfolio.findOneAndUpdate(
      { user: req.user._id },
      { views: [], totalViews: 0 }
    );

    res.json({ success: true, message: 'Analytics reset ho gaya.' });

  } catch (error) {
    res.status(500).json({ error: 'Analytics reset karne mein kuch gadbad hui.' });
  }
});

module.exports = router;
