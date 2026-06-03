const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter;

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    console.log("[mailer] SMTP não configurado — mensagem não enviada:", { to, subject, text: text?.slice?.(0, 200) });
    return { skipped: true };
  }
  return t.sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
