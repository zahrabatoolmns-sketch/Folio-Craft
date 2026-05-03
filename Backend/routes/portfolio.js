const express   = require('express');
const router    = express.Router();
const Portfolio = require('../models/Portfolio');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/portfolio/all - Sare portfolios lo

router.get('/all', async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id })
      .select('-views')
      .sort({ updatedAt: -1 });

    res.json({ success: true, portfolios });
  } catch (error) {
    res.status(500).json({ error: 'Something wrong with bringing portfolio.' });
  }
});

// POST /api/portfolio/create - Naya portfolio banao

router.post('/create', async (req, res) => {
  try {
    const { portfolioName } = req.body;
    const count = await Portfolio.countDocuments({ user: req.user._id });

    const portfolio = await Portfolio.create({
      user: req.user._id,
      portfolioName: portfolioName || 'My Portfolio ' + (count + 1),
      fullname: req.user.name,
      email: req.user.email
    });
    res.status(201).json({
      success: true,
      message: 'New portfolio generated!',
      portfolio
    });
  } catch (error) {
    res.status(500).json({ error: 'Something is wrong with generating portfolio.' });
  }
});

// GET /api/portfolio/:id - Ek portfolio lo
router.get('/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    }).select('-views');

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    res.json({ success: true, portfolio });
  } catch (error) {
    res.status(500).json({ error: 'Something wrong with bringing portfolio.' });
  }
});

// GET /api/portfolio - Default portfolio lo
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
    res.status(500).json({ error: 'Something wrong with bringing portfolio.' });
  }
});

// PUT /api/portfolio/:id - Portfolio update karo
router.put('/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
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

    res.json({ success: true, message: 'Portfolio saved!', portfolio });
  } catch (error) {
    res.status(500).json({ error: 'Something wrong with bringing portfolio.' });
  }
});

// PUT /api/portfolio - Default portfolio update
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

    res.json({ success: true, message: 'Portfolio saved!', portfolio });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong saving portfolio.' });
  }
});

// DELETE /api/portfolio/:id - Portfolio delete
router.delete('/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    await Portfolio.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Portfolio deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Somehing went wrong with deleting portfolio .' });
  }
});

// POST /api/portfolio/:id/publish
router.post('/:id/publish', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    if (!portfolio.fullname) {
      return res.status(400).json({
        error: 'Save name before publishing.'
      });
    }

    // Agar shareId nahi hai to generate karo
    if (!portfolio.shareId) {
      const crypto = require('crypto');
      portfolio.shareId = crypto.randomBytes(5).toString('hex');
    }

    portfolio.isPublished = true;
    await portfolio.save();

    const baseUrl = 'https://folio-craft-6frg.vercel.app';
const shareUrl = `${baseUrl}/p/${portfolio.shareId}`;

    res.json({
      success: true,
      message: 'Portfolio published!',
      shareUrl,
      shareId: portfolio.shareId
    });

  } catch (error) {
    res.status(500).json({ error: 'Something went wrong with publishing portfolio.' });
  }
});

// GET /api/portfolio/:id/share-link
router.get('/:id/share-link', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    if (!portfolio.isPublished) {
      return res.status(400).json({ error: 'Publish the portfolio first.' });
    }

    const shareUrl = `${process.env.APP_BASE_URL}/p/${portfolio.shareId}`;
    res.json({ success: true, shareUrl, shareId: portfolio.shareId });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get share link.' });
  }
});

module.exports = router;

