import nodemailer from "nodemailer";

const { GMAIL_PASS, GMAIL_USER } = process.env;

if (!GMAIL_PASS || !GMAIL_USER) {
  // You can still boot without email, but warn loudly
  console.warn(
    "[mailer] SMTP env not fully set – password emails will NOT send.",
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, link: string) {
  if (!transporter) {
    console.log(`[mailer] (dev) Password reset link for ${to}: ${link}`);
    return;
  }
  const html = `
  <div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#111; padding:24px">
    <div style="max-width:560px;margin:0 auto;border:1px solid #eee;border-radius:16px;padding:24px">
      <div style="text-align:center;margin-bottom:16px">
        <div style="display:inline-flex;width:56px;height:56px;border-radius:12px;background:#000;align-items:center;justify-content:center;">
          <span style="color:#fff;font-weight:800;font-size:14px;">PS</span>
        </div>
        <div style="margin-top:8px;font-weight:700;font-size:20px;">ProdScale</div>
      </div>

      <h2 style="font-size:18px;margin:12px 0">Reset your password</h2>
      <p style="color:#444;line-height:1.6;margin:0 0 12px">
        We received a request to reset your password. This link will expire in 1 hour.
      </p>

      <a href="${link}"
         style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:600;margin:12px 0">
        Reset Password
      </a>

      <p style="color:#666;font-size:12px;margin-top:16px">
        If you didn’t request this, you can safely ignore this email.
      </p>
    </div>
    <p style="color:#9aa; font-size:11px; text-align:center; margin-top:12px">© ${new Date().getFullYear()} ProdScale</p>
  </div>`;
  await transporter.sendMail({
    to,
    from: `ProdScale <${GMAIL_USER}>`,
    subject: "Reset your ProdScale password",
    html,
  });
}
