const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Password Reset Email ──
async function sendPasswordResetEmail(toEmail, resetToken, userName) {
  const resetUrl = `https://folio-craft-6frg.vercel.app/reset-password.html?token=${resetToken}`;
  const year     = new Date().getFullYear();

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      toEmail,
    subject: 'Reset your FolioCraft password',
    html: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Reset your password — FolioCraft</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { margin:0; padding:0; box-sizing:border-box; }

    body, html {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      background-color: #f2f4f8;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    img { border:0; display:block; }
    a   { color: inherit; }

    .outer {
      width: 100%;
      background-color: #f2f4f8;
      padding: 48px 16px 64px;
    }

    .inner {
      max-width: 560px;
      margin: 0 auto;
    }

    /* ── Wordmark ── */
    .wordmark {
      text-align: center;
      margin-bottom: 28px;
    }

    .wordmark-text {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #1a1d2e;
    }

    .wordmark-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      background: linear-gradient(135deg, #5b4de8, #0ba89a);
      border-radius: 50%;
      margin-left: 3px;
      vertical-align: middle;
      position: relative;
      top: -2px;
    }

    /* ── Card Shell ── */
    .card {
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow:
        0 1px 2px rgba(0,0,0,0.04),
        0 4px 12px rgba(0,0,0,0.06),
        0 16px 40px rgba(0,0,0,0.07);
    }

    /* ── Hero Banner ── */
    .hero {
      background: #0f1120;
      padding: 52px 48px 48px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    /* Noise-free subtle radial glow */
    .hero::before {
      content: '';
      position: absolute;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      width: 340px;
      height: 240px;
      background: radial-gradient(ellipse at center,
        rgba(91,77,232,0.28) 0%,
        rgba(11,168,154,0.14) 50%,
        transparent 75%
      );
      pointer-events: none;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 999px;
      padding: 6px 14px;
      margin-bottom: 24px;
    }

    .hero-badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 0 2px rgba(34,197,94,0.25);
    }

    .hero-badge span {
      font-size: 12px;
      font-weight: 500;
      color: rgba(255,255,255,0.65);
      letter-spacing: 0.02em;
    }

    /* Lock icon — pure CSS/SVG, no emoji */
    .hero-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 24px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero h1 {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.03em;
      line-height: 1.2;
      margin-bottom: 10px;
      position: relative;
    }

    .hero-sub {
      font-size: 15px;
      color: rgba(255,255,255,0.5);
      line-height: 1.6;
      position: relative;
    }

    /* ── Body ── */
    .body {
      padding: 44px 48px 40px;
    }

    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #0f1120;
      margin-bottom: 14px;
    }

    .para {
      font-size: 15px;
      color: #4a5568;
      line-height: 1.75;
      margin-bottom: 0;
    }

    /* ── Timer strip ── */
    .timer-strip {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 12px;
      padding: 13px 18px;
      margin: 28px 0;
    }

    .timer-icon {
      width: 32px;
      height: 32px;
      background: #fef3c7;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .timer-text {
      font-size: 13px;
      color: #92400e;
      line-height: 1.5;
    }

    .timer-text strong {
      font-weight: 700;
      color: #78350f;
    }

    /* ── CTA Button ── */
    .btn-wrap {
      text-align: center;
      margin: 8px 0 32px;
    }

    .btn {
      display: inline-block;
      padding: 17px 48px;
      background: linear-gradient(135deg, #5b4de8 0%, #0ba89a 100%);
      color: #ffffff !important;
      text-decoration: none !important;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.01em;
      box-shadow:
        0 4px 12px rgba(91,77,232,0.3),
        0 8px 24px rgba(91,77,232,0.2);
    }

    .btn-sub {
      font-size: 12px;
      color: #a0aec0;
      text-align: center;
      margin-top: 12px;
    }

    /* ── Separator ── */
    .sep {
      height: 1px;
      background: #edf2f7;
      margin: 32px 0;
    }

    /* ── URL fallback ── */
    .url-block {
      background: #f7f9fc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
    }

    .url-label {
      font-size: 11px;
      font-weight: 700;
      color: #a0aec0;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .url-text {
      font-size: 12px;
      color: #5b4de8;
      word-break: break-all;
      line-height: 1.6;
      text-decoration: none;
      font-family: 'Courier New', Courier, monospace;
    }

    /* ── Security note ── */
    .security-note {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 16px 18px;
      margin-top: 20px;
    }

    .security-icon {
      width: 28px;
      height: 28px;
      background: #dcfce7;
      border-radius: 8px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 1px;
    }

    .security-note p {
      font-size: 13px;
      color: #166534;
      line-height: 1.65;
    }

    .security-note strong {
      font-weight: 600;
      color: #14532d;
    }

    /* ── Footer ── */
    .footer {
      background: #f7f9fc;
      border-top: 1px solid #edf2f7;
      padding: 28px 48px 32px;
    }

    .footer-logo {
      font-size: 13px;
      font-weight: 700;
      color: #1a1d2e;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }

    .footer p {
      font-size: 12px;
      color: #a0aec0;
      line-height: 1.7;
    }

    .footer a {
      color: #5b4de8;
      text-decoration: none;
    }

    .footer-divider {
      height: 1px;
      background: #edf2f7;
      margin: 16px 0;
    }

    .footer-links {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .footer-links a {
      font-size: 12px;
      color: #a0aec0;
      text-decoration: none;
      transition: color 0.2s;
    }

    /* ── Below card ── */
    .below-card {
      text-align: center;
      margin-top: 28px;
    }

    .below-card p {
      font-size: 12px;
      color: #a0b0c4;
      line-height: 1.7;
    }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .outer  { padding: 24px 12px 48px; }
      .hero   { padding: 40px 28px 36px; }
      .body   { padding: 32px 28px 28px; }
      .footer { padding: 24px 28px; }
      .hero h1 { font-size: 24px; }
      .btn    { padding: 15px 36px; font-size: 14px; }
    }
  </style>
</head>
<body>
<div class="outer">
  <div class="inner">

    <!-- Wordmark -->
    <div class="wordmark">
      <span class="wordmark-text">FolioCraft<span class="wordmark-dot"></span></span>
    </div>

    <div class="card">

      <!-- Hero -->
      <div class="hero">

        <div class="hero-badge">
          <div class="hero-badge-dot"></div>
          <span>Security notification</span>
        </div>

        <!-- Lock SVG icon -->
        <div class="hero-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="15" width="18" height="13" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
            <path d="M10.5 15V11a5.5 5.5 0 0 1 11 0v4" stroke="rgba(255,255,255,0.55)" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="16" cy="21.5" r="2" fill="rgba(255,255,255,0.6)"/>
            <line x1="16" y1="23.5" x2="16" y2="25.5" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>

        <h1>Reset your password</h1>
        <p class="hero-sub">We received a request to reset the password<br/>for your FolioCraft account.</p>

      </div>

      <!-- Body -->
      <div class="body">

        <p class="greeting">Hi ${userName},</p>

        <p class="para">
          Click the button below to choose a new password for your account.
          This link is single-use and will expire shortly for your security.
        </p>

        <!-- Timer strip -->
        <div class="timer-strip">
          <div class="timer-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
            </svg>
          </div>
          <div class="timer-text">
            This link expires in <strong>1 hour</strong>.
            After that, you'll need to request a new one.
          </div>
        </div>

        <!-- CTA -->
        <div class="btn-wrap">
          <a href="${resetUrl}" class="btn">Reset my password</a>
          <p class="btn-sub">Button not working? Use the link below.</p>
        </div>

        <div class="sep"></div>

        <!-- URL Fallback -->
        <div class="url-block">
          <p class="url-label">Copy link manually</p>
          <a href="${resetUrl}" class="url-text">${resetUrl}</a>
        </div>

        <!-- Security note -->
        <div class="security-note">
          <div class="security-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <p>
            <strong>Didn't request this?</strong> You can safely ignore this email —
            your current password will not change and your account remains secure.
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-logo">FolioCraft</p>
        <p>
          This message was sent to <strong style="color:#4a5568">${toEmail}</strong> because a
          password reset was requested for this address.
        </p>
        <div class="footer-divider"></div>
        <div class="footer-links">
          <a href="https://folio-craft-6frg.vercel.app">Home</a>
          <a href="mailto:support@foliocraft.com">Contact support</a>
        </div>
        <p style="margin-top:14px">&copy; ${year} FolioCraft. All rights reserved.</p>
      </div>

    </div>

    <!-- Below card -->
    <div class="below-card">
      <p>
        You're receiving this email because a password reset was<br/>
        requested for your account. This is an automated message.
      </p>
    </div>

  </div>
</div>
</body>
</html>
    `
  });
}

module.exports = { sendPasswordResetEmail };