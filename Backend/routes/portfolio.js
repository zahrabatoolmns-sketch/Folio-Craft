const express   = require('express');
const router    = express.Router();
const Portfolio = require('../models/Portfolio');
const { protect } = require('../middleware/auth');

router.use(protect);

// ─────────────────────────────────────────────
// GET /api/portfolio/all - Sare portfolios lo
// ─────────────────────────────────────────────
router.get('/all', async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id })
      .select('-views')
      .sort({ updatedAt: -1 });

    res.json({ success: true, portfolios });
  } catch (error) {
    res.status(500).json({ error: 'Portfolios laane mein kuch gadbad hui.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/portfolio/create - Naya portfolio banao
// ─────────────────────────────────────────────
router.post('/create', async (req, res) => {
  try {
    const { portfolioName } = req.body;

    // Free plan mein max 3 portfolios
    const count = await Portfolio.countDocuments({ user: req.user._id });
    if (count >= 3) {
      return res.status(400).json({
        error: 'Free plan mein maximum 3 portfolios ban sakte hain.'
      });
    }

    const portfolio = await Portfolio.create({
      user: req.user._id,
      portfolioName: portfolioName || 'My Portfolio ' + (count + 1),
      fullname: req.user.name,
      email: req.user.email
    });

    res.status(201).json({
      success: true,
      message: 'Naya portfolio ban gaya!',
      portfolio
    });
  } catch (error) {
    res.status(500).json({ error: 'Portfolio banane mein kuch gadbad hui.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/portfolio/:id - Ek portfolio lo
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    }).select('-views');

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio nahi mila.' });
    }

    res.json({ success: true, portfolio });
  } catch (error) {
    res.status(500).json({ error: 'Portfolio laane mein kuch gadbad hui.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/portfolio - Default portfolio lo
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id })
      .select('-views')
      .sort({ updatedAt: -1 });

    if (!portfolio) {
      portfolio = await Portfolio.create({
        user: req.user._id,
        fullname: req.user.name,
        email: req.user.email
      });
    }

    res.json({ success: true, portfolio });
  } catch (error) {
    res.status(500).json({ error: 'Portfolio laane mein kuch gadbad hui.' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/portfolio/:id - Portfolio update karo
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio nahi mila.' });
    }

    const fields = [
      'portfolioName', 'fullname', 'title', 'bio', 'profile_base64',
      'location', 'email', 'phone', 'description', 'skills_summary',
      'skills', 'projects', 'experience', 'education',
      'linkedin', 'github_social', 'instagram', 'selectedTemplate'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        portfolio[field] = req.body[field];
      }
    });

    portfolio.metaTitle       = `${portfolio.fullname} | Portfolio`;
    portfolio.metaDescription = portfolio.bio || portfolio.description || '';

    await portfolio.save();

    res.json({ success: true, message: 'Portfolio save ho gaya!', portfolio });
  } catch (error) {
    res.status(500).json({ error: 'Portfolio save karne mein kuch gadbad hui.' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/portfolio - Default portfolio update
// ─────────────────────────────────────────────
router.put('/', async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user._id });
    }

    const fields = [
      'portfolioName', 'fullname', 'title', 'bio', 'profile_base64',
      'location', 'email', 'phone', 'description', 'skills_summary',
      'skills', 'projects', 'experience', 'education',
      'linkedin', 'github_social', 'instagram', 'selectedTemplate'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        portfolio[field] = req.body[field];
      }
    });

    await portfolio.save();

    res.json({ success: true, message: 'Portfolio save ho gaya!', portfolio });
  } catch (error) {
    res.status(500).json({ error: 'Portfolio save karne mein kuch gadbad hui.' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/portfolio/:id - Portfolio delete
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio nahi mila.' });
    }

    await Portfolio.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Portfolio delete ho gaya.' });
  } catch (error) {
    res.status(500).json({ error: 'Portfolio delete karne mein kuch gadbad hui.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/portfolio/:id/publish - Publish karo
// ─────────────────────────────────────────────
router.post('/:id/publish', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio nahi mila.' });
    }

    if (!portfolio.fullname) {
      return res.status(400).json({
        error: 'Publish karne se pehle naam save karo.'
      });
    }

    portfolio.isPublished = true;
    await portfolio.save();

    const shareUrl = `${process.env.APP_BASE_URL}/p/${portfolio.shareId}`;

    res.json({
      success: true,
      message: 'Portfolio publish ho gaya!',
      shareUrl,
      shareId: portfolio.shareId
    });
  } catch (error) {
    res.status(500).json({ error: 'Publish karne mein kuch gadbad hui.' });
  }
});

module.exports = router;