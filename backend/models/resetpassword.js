// models/resetpassword.js
const mongoose = require('mongoose');

const resetPasswordSchema = new mongoose.Schema({
  pen: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // OTP expires in 5 minutes
  }
});

module.exports = mongoose.model('ResetPassword', resetPasswordSchema);
