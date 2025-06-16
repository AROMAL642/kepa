const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Use bcryptjs since your main server uses it
const User = require('../models/User');

// Register a user by admin (role can be admin/fuel/repair/mti etc.)
router.post('/', async (req, res) => {
  const {
    pen, generalNo, name, email, phone, licenseNo,
    dob, gender, bloodGroup, password, photo, signature, role
  } = req.body;

  try {
    const existingUser = await User.findOne({ pen });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this PEN already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      pen,
      name,
      email,
      phone,
      licenseNo,
      dob,
      gender,
      bloodGroup,
      password: hashedPassword,
      photo,
      signature,
      role: role || 'user',
      verified: 'YES'
    };

    // Only include generalNo if it's not an empty string
    if (generalNo && generalNo.trim() !== '') {
      userData.generalNo = generalNo.trim();
    }

    const newUser = new User(userData);

    await newUser.save();
    res.status(201).json({ message: 'User registration successfull' });
  } catch (err) {
    console.error('Error registering user by admin:', err);
    res.status(500).json({ message: 'Registration by admin failed', error: err.message });
  }
});

module.exports = router;
