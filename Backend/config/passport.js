// ══════════════════════════════════════
//   config/passport.js
// ══════════════════════════════════════

const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User           = require('../models/User');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.NODE_ENV === 'production'
    ? 'https://folio-craft-two.vercel.app/api/auth/google/callback'
    : 'http://localhost:5000/api/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Pehle dekho user pehle se hai
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      return done(null, user);
    }

    // Naya user banao
    user = await User.create({
      name:       profile.displayName,
      email:      profile.emails[0].value,
      password:   'google-' + Math.random().toString(36).slice(-8),
      isVerified: true,
      googleId:   profile.id
    });

    done(null, user);

  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;