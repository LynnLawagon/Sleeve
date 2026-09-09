import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter !== undefined) return transporter;
  if (!process.env.SMTP_HOST) {
    transporter = null; // no SMTP configured — caller falls back to logging
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

export async function sendVerificationEmail(toEmail, token) {
  const link = `${process.env.APP_URL || "http://localhost:5173"}/verify?token=${token}`;
  const t = getTransporter();

  if (!t) {
    // No SMTP set up yet (common for a fresh Laragon install) — print the
    // link instead so you can still test the flow end to end locally.
    console.log(`\n[Sleeve] No SMTP configured. Verification link for ${toEmail}:\n${link}\n`);
    return;
  }

  await t.sendMail({
    from: process.env.SMTP_FROM || '"Sleeve" <no-reply@sleeve.local>',
    to: toEmail,
    subject: "Confirm your email for Sleeve",
    text: `Confirm your email to start using Sleeve: ${link}`,
    html: `<p>Confirm your email to start using Sleeve.</p><p><a href="${link}">${link}</a></p>`,
  });
}
