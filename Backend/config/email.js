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
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your password — FolioCraft</title>
</head>
<body style="margin:0;padding:0;background-color:#eef0f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef0f7;padding:48px 16px 64px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Wordmark -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <span style="font-size:20px;font-weight:700;letter-spacing:-0.03em;color:#1a1d2e;">FolioCraft</span>
              <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#5b4de8;margin-left:3px;vertical-align:middle;position:relative;top:-2px;"></span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.09);">

              <!-- Hero -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#0f1120;padding:52px 48px 44px;text-align:center;">

                    <!-- Badge -->
                    <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);border-radius:999px;padding:6px 16px;margin-bottom:28px;">
                      <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;margin-right:7px;vertical-align:middle;"></span>
                      <span style="font-size:12px;font-weight:500;color:rgba(255,255,255,0.65);letter-spacing:0.03em;vertical-align:middle;">Security notification</span>
                    </div>

                    <!-- Icon — emoji works in all email clients -->
                    <div style="width:72px;height:72px;margin:0 auto 24px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.13);border-radius:20px;text-align:center;line-height:72px;font-size:30px;">
                      &#128274;
                    </div>

                    <h1 style="margin:0 0 10px;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.03em;line-height:1.2;">Reset your password</h1>
                    <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.5);line-height:1.6;">We received a request to reset the password<br/>for your FolioCraft account.</p>

                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:44px 48px 40px;">

                    <!-- Greeting -->
                    <p style="margin:0 0 14px;font-size:16px;font-weight:600;color:#0f1120;">Hi ${userName},</p>

                    <!-- Paragraph -->
                    <p style="margin:0;font-size:15px;color:#4a5568;line-height:1.75;">
                      Click the button below to choose a new password for your account.
                      This link is single-use and will expire shortly for your security.
                    </p>

                    <!-- Timer strip -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
                      <tr>
                        <td style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-right:12px;vertical-align:middle;">
                                <div style="width:36px;height:36px;background:#fef3c7;border-radius:9px;text-align:center;line-height:36px;font-size:18px;">&#9201;</div>
                              </td>
                              <td style="vertical-align:middle;">
                                <span style="font-size:13px;color:#92400e;line-height:1.5;">
                                  This link expires in <strong style="color:#78350f;">1 hour</strong>.
                                  After that, you'll need to request a new one.
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;">
                      <tr>
                        <td align="center" style="padding-bottom:12px;">
                          <a href="${resetUrl}"
                             style="display:inline-block;padding:17px 52px;background:linear-gradient(135deg,#5b4de8 0%,#0ba89a 100%);color:#ffffff;text-decoration:none;border-radius:14px;font-size:15px;font-weight:600;letter-spacing:0.01em;mso-padding-alt:0;box-shadow:0 4px 16px rgba(91,77,232,0.35);">
                            <!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
                            Reset my password &rarr;
                            <!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%">&nbsp;</i><![endif]-->
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <span style="font-size:12px;color:#a0aec0;">Button not working? Use the link below.</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <div style="height:1px;background:#edf2f7;margin:0 0 32px;"></div>

                    <!-- URL Fallback -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="background:#f7f9fc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;">
                          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#a0aec0;letter-spacing:0.1em;text-transform:uppercase;">Copy link manually</p>
                          <a href="${resetUrl}" style="font-size:12px;color:#5b4de8;word-break:break-all;line-height:1.6;text-decoration:none;font-family:'Courier New',Courier,monospace;">${resetUrl}</a>
                        </td>
                      </tr>
                    </table>

                    <!-- Security note -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 18px;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-right:12px;vertical-align:top;padding-top:2px;">
                                <div style="width:32px;height:32px;background:#dcfce7;border-radius:8px;text-align:center;line-height:32px;font-size:15px;">&#128737;</div>
                              </td>
                              <td style="vertical-align:middle;">
                                <p style="margin:0;font-size:13px;color:#166534;line-height:1.65;">
                                  <strong style="font-weight:600;color:#14532d;">Didn't request this?</strong>
                                  You can safely ignore this email — your current password will not change and your account remains secure.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#f7f9fc;border-top:1px solid #edf2f7;padding:28px 48px 32px;">

                    <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#1a1d2e;letter-spacing:-0.02em;">FolioCraft</p>

                    <p style="margin:0 0 16px;font-size:12px;color:#a0aec0;line-height:1.7;">
                      This message was sent to <strong style="color:#4a5568;">${toEmail}</strong> because a
                      password reset was requested for this address.
                    </p>

                    <div style="height:1px;background:#edf2f7;margin-bottom:16px;"></div>

                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                      <tr>
                        <td style="padding-right:20px;">
                          <a href="https://folio-craft-6frg.vercel.app" style="font-size:12px;color:#718096;text-decoration:none;">Home</a>
                        </td>
                        <td>
                          <a href="mailto:support@foliocraft.com" style="font-size:12px;color:#718096;text-decoration:none;">Contact support</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0;font-size:12px;color:#a0aec0;">&copy; ${year} FolioCraft. All rights reserved.</p>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Below card note -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="font-size:12px;color:#a0b0c4;line-height:1.7;margin:0;">
                You're receiving this because a password reset was<br/>
                requested for your account. This is an automated message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `
  });
}

module.exports = { sendPasswordResetEmail };