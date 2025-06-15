const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const ResetPassword = require('../models/resetpassword');
const User = require('../models/User'); 
const bcrypt = require('bcrypt');

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send OTP
router.post('/resetpassword', async (req, res) => {
  const { pen } = req.body;

  try {
    const user = await User.findOne({ pen });

    if (!user) {
      return res.status(404).json({ message: 'PEN not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await ResetPassword.findOneAndUpdate(
      { pen },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`
    };

    await transporter.sendMail(mailOptions);

    return res.json({ message: 'OTP sent successfully to your email' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verifyotp', async (req, res) => {
  const { pen, otp } = req.body;

  try {
    const record = await ResetPassword.findOne({ pen }); 

    if (!record) {
      return res.status(400).json({ message: 'No OTP found for this PEN' });
    }

    if (record.otp === otp) {
      return res.json({ success: true, message: 'OTP Verified' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update Password Route
router.post('/updatepassword', async (req, res) => {
  const { pen, newPassword } = req.body;

  try {
    const user = await User.findOne({ pen });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Optionally delete OTP after successful password reset
    await ResetPassword.deleteOne({ pen });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
