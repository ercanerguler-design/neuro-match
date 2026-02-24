const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async ({ email, subject, message, html }) => {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: email,
    subject,
    text: message,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  logger.info(`Email sent: ${info.messageId}`);
};

module.exports = sendEmail;
