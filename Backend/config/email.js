
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
  

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      toEmail,
    subject: 'FolioCraft — Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Reset Your Password</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #eef0f7;
            padding: 40px 16px;
          }

          .wrapper {
            max-width: 520px;
            margin: 0 auto;
          }

          /* ── Top Brand Bar ── */
          .brand {
            text-align: center;
            margin-bottom: 24px;
          }

          .brand-name {
            font-size: 22px;
            font-weight: 700;
            background: linear-gradient(135deg, #5b4de8, #0ba89a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.02em;
          }

          /* ── Card ── */
          .card {
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 8px 40px rgba(0,0,0,0.10);
          }

          /* ── Header ── */
          .header {
            background: linear-gradient(135deg, #5b4de8 0%, #0ba89a 100%);
            padding: 48px 40px 40px;
            text-align: center;
            position: relative;
          }

          .header-icon {
            width: 64px;
            height: 64px;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            font-size: 28px;
          }

          .header h1 {
            color: #ffffff;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin: 0;
          }

          .header p {
            color: rgba(255,255,255,0.75);
            font-size: 14px;
            margin-top: 8px;
          }

          /* ── Body ── */
          .body {
            padding: 40px;
          }

          .greeting {
            font-size: 16px;
            color: #0f1623;
            font-weight: 600;
            margin-bottom: 12px;
          }

          .body p {
            color: #556070;
            font-size: 14px;
            line-height: 1.75;
            margin-bottom: 16px;
          }

          /* ── Divider ── */
          .divider {
            height: 1px;
            background: #eef0f7;
            margin: 28px 0;
          }

          /* ── Button ── */
          .btn-wrap {
            text-align: center;
            margin: 32px 0;
          }

          .btn {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #5b4de8, #0ba89a);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 999px;
            font-weight: 600;
            font-size: 15px;
            letter-spacing: 0.01em;
            box-shadow: 0 8px 24px rgba(91,77,232,0.35);
            transition: all 0.2s;
          }

          /* ── Expiry Badge ── */
          .expiry {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #fff8e6;
            border: 1px solid #fde68a;
            border-radius: 999px;
            padding: 6px 14px;
            font-size: 12px;
            color: #92400e;
            font-weight: 500;
            margin-bottom: 24px;
          }

          /* ── URL Fallback ── */
          .url-box {
            background: #f8f9fc;
            border: 1px solid #e2e6f0;
            border-radius: 12px;
            padding: 14px 16px;
            margin-top: 20px;
          }

          .url-box p {
            font-size: 11px;
            color: #90a0b4;
            margin-bottom: 6px !important;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            font-weight: 600;
          }

          .url-box a {
            font-size: 12px;
            color: #5b4de8;
            word-break: break-all;
            text-decoration: none;
          }

          /* ── Note ── */
          .note {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 14px 16px;
            font-size: 13px;
            color: #166534;
            margin-top: 20px;
            line-height: 1.6;
          }

          /* ── Footer ── */
          .footer {
            background: #f8f9fc;
            border-top: 1px solid #eef0f7;
            padding: 24px 40px;
            text-align: center;
          }

          .footer p {
            font-size: 12px;
            color: #90a0b4;
            line-height: 1.6;
          }

          .footer a {
            color: #5b4de8;
            text-decoration: none;
          }

          .footer-brand {
            font-size: 14px;
            font-weight: 700;
            color: #5b4de8;
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">

          <!-- Brand -->
          <div class="brand">
            <span class="brand-name">FolioCraft</span>
          </div>

          <div class="card">

            <!-- Header -->
            <div class="header">
              <div class="header-icon">🔐</div>
              <h1>Reset Your Password</h1>
              <p>We received a request to reset your password</p>
            </div>

            <!-- Body -->
            <div class="body">

              <p class="greeting">Hi ${userName},</p>

              <p>
                Someone requested a password reset for your FolioCraft account.
                If this was you, click the button below to create a new password.
              </p>

              <!-- Expiry Badge -->
              <div class="expiry">
                ⏱ This link expires in <strong>&nbsp;1 hour</strong>
              </div>

              <!-- Button -->
              <div class="btn-wrap">
                <a href="${resetUrl}" class="btn">
                  Reset My Password
                </a>
              </div>

              <div class="divider"></div>

              <!-- URL Fallback -->
              <div class="url-box">
                <p>Or copy this link into your browser</p>
                <a href="${resetUrl}">${resetUrl}</a>
              </div>

              <!-- Security Note -->
              <div class="note">
                🔒 If you did not request a password reset, you can safely ignore
                this email. Your password will not change.
              </div>

            </div>

            <!-- Footer -->
            <div class="footer">
              <p class="footer-brand">FolioCraft</p>
              <p>
                This email was sent to <strong>${toEmail}</strong><br/>
                &copy; ${new Date().getFullYear()} FolioCraft. All rights reserved.
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