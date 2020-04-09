const Exotel = require("exotel-node");

Exotel.init(
  process.env.EXOTEL_SID,
  process.env.EXOTEL_TOKEN,
  process.env.EXOTEL_NUMBER
);

const sendSMS = (number, otp) => {
  return new Promise((resolve, reject) => {
    const message = `We received a forgot password request from you, your OTP is ${otp}`;
    Exotel.sendSMS(number, message, function(error, response) {
      if (error) {
        reject(error);
      } else resolve(response);
    });
  });
};

module.exports = sendSMS;
