const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.put('/update', async (req, res) => {
  const { pen, name, dob, email, mobile, licenseNo, photo } = req.body;

  if (!pen) return res.status(400).json({ message: 'PEN is required for update' });

  try {
    const updatedUser = await User.findOneAndUpdate(
      { pen },
      {
        $set: {
          name,
          dob,
          email,
          phone: mobile,
          licenseNo,
          photo
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ updatedUser });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

module.exports = router;
