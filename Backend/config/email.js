// ══════════════════════════════════════
//   config/email.js
// ══════════════════════════════════════

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
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      toEmail,
    subject: 'FolioCraft — Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f2f4f9; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #5b4de8, #0ba89a); padding: 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .body { padding: 32px; }
          .body p { color: #556070; line-height: 1.7; margin-bottom: 20px; }
          .btn { display: block; width: fit-content; margin: 0 auto; padding: 14px 32px; background: linear-gradient(135deg, #5b4de8, #0ba89a); color: white; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px; }
          .note { font-size: 12px; color: #90a0b4; text-align: center; margin-top: 20px; }
          .footer { background: #f2f4f9; padding: 16px; text-align: center; font-size: 12px; color: #90a0b4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FolioCraft</h1>
          </div>
          <div class="body">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Tumne password reset request ki hai. Neeche button click karo — yeh link <strong>1 ghante</strong> ke liye valid hai.</p>
            <a href="${resetUrl}" class="btn">Reset Password</a>
            <p class="note">Agar tumne yeh request nahi ki to is email ko ignore karo.</p>
          </div>
          <div class="footer">FolioCraft — Portfolio Builder</div>
        </div>
      </body>
      </html>
    `
  });
}

module.exports = { sendPasswordResetEmail };