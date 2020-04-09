const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secureConnection: true,
  port: 587,
  auth: {
    user: process.env.OTP_EMAIL,
    pass: process.env.OTP_EMAIL_PASSWORD
  }
});

const sendMail = (email, otp) => {
  return new Promise((resolve, reject) => {
    const details = {
      from: process.env.OTP_EMAIL,
      to: email, // Receiver's email id
      subject: "Forgot Password : OTP for Millow", // Subject of the mail.
      html: `Hello, <br/> We received a forgot password request from you. Please enter <br> ${otp} <br> as the OTP to reset your password`
    };
    transporter.sendMail(details, function(error, data) {
      if (error) reject(error);
      else resolve(data);
    });
  });
};

module.exports = sendMail;
