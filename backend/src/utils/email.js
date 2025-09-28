const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

async function sendPaylinkEmail({ to, subject, html, text }) {
  return transporter.sendMail({
    from: "no-reply@waterbills.com",
    to,
    subject,
    html,
    text,
  });
}

module.exports = { sendPaylinkEmail };
