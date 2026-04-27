// ══════════════════════════════════════════
//   models/User.js - User Database Schema
// ══════════════════════════════════════════

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({

  // ── Basic Info ──
  name: {
    type: String,
    required: [true, 'Naam zaruri hai'],
    trim: true,
    maxlength: [100, 'Naam 100 characters se zyada nahi ho sakta']
  },

  email: {
    type: String,
    required: [true, 'Email not required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Add correct email address']
  },

  password: {
    type: String,
    required: false,
    minlength: [6, 'Password length should be minimum 6'],
    select: false
  },
  
  // ── Account Status ──
  isVerified: {
    type: Boolean,
    default: false
  },

  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // ── Analytics ──
  totalViews: {
    type: Number,
    default: 0
  },

 // ── Google Auth ──
  googleId: {
    type: String,
    sparse: true,
    default: null
  },

  avatar: {
    type: String,
    default: null
  },

  // ── Timestamps ──
}, { timestamps: true });

// ── Password Hash - Save se pehle ──
userSchema.pre('save', async function(next) {
  // Sirf tab hash karo jab password change hua ho
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ── Password Compare Method ──
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Safe User Object (password hide) ──
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
