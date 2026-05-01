
const mongoose = require('mongoose');
const crypto = require('crypto');

// ── Skill Sub-Schema ──
const skillSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  level:    { type: Number, min: 0, max: 100, default: 50 },
  category: { type: String, default: 'Other' }
}, { _id: false });

// ── Project Sub-Schema ──
const projectSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String },
  tech:         [{ type: String }],
  github:       { type: String },
  live:         { type: String },
  image_base64: { type: String }  
}, { _id: true });

// ── Experience Sub-Schema ──
const experienceSchema = new mongoose.Schema({
  jobTitle:    { type: String, required: true },
  company:     { type: String, required: true },
  description: { type: String }
}, { _id: true });

// ── Education Sub-Schema ──
const educationSchema = new mongoose.Schema({
  degree:    { type: String, required: true },
  institute: { type: String, required: true },
  field:     { type: String }
}, { _id: true });

// ── Analytics View Sub-Schema ──
const viewSchema = new mongoose.Schema({
  date:      { type: Date, default: Date.now },
  country:   { type: String },
  device:    { type: String },      // mobile, desktop, tablet
  referrer:  { type: String }
}, { _id: false });

// ── Main Portfolio Schema ──
const portfolioSchema = new mongoose.Schema({

  // ── Owner ──
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ── Unique Share URL ──
  shareId: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(5).toString('hex')    
  },

  // ── Personal Info (Step 1) ──
  fullname:       { type: String, trim: true },
  title:          { type: String },
  bio:            { type: String },
  profile_base64: { type: String },     
  location:       { type: String },
  email:          { type: String },
  phone:          { type: String },
  description:    { type: String },
  skills_summary: { type: String },

  // ── Skills & Projects (Step 2) ──
  skills:   [skillSchema],
  projects: [projectSchema],

  // ── Experience & Education (Step 3) ──
  experience: [experienceSchema],
  education:  [educationSchema],

  // ── Social Links (Step 4) ──
  linkedin:       { type: String },
  github_social:  { type: String },
  instagram:      { type: String },

  // ── Template (Step 5) ──
  selectedTemplate: {
    type: String,
    default: 'modern-dark',
    enum: [
      'modern-dark', 'minimal-white', 'cyber-neon',
      'creative-gradient', 'split-layout', 'corporate',
      'card-grid', 'cv-single', 'neumorphism', 'terminal'
    ]
  },

  // ── Portfolio Settings ──
  portfolioName: {
    type: String,
    default: 'My Portfolio',
    trim: true
  },

  customDomain: { type: String },

  // ── Analytics ──
  views: [viewSchema],
  totalViews: { type: Number, default: 0 },

  // ── SEO ──
  metaTitle:       { type: String },
  metaDescription: { type: String },

}, { timestamps: true });

// ── View Count Update ──
portfolioSchema.methods.recordView = async function(viewData = {}) {
  this.views.push(viewData);
  this.totalViews += 1;

  if (this.views.length > 1000) {
    this.views = this.views.slice(-1000);
  }

  await this.save();
};

// Safe Portfolio Data  //
portfolioSchema.methods.toPublicObject = function() {
  const obj = this.toObject();
  // Analytics data share link pe na dikhao
  delete obj.views;
  delete obj.user;
  return obj;
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
