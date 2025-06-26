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



router.put('/update-admin', async (req, res) => {
  const { pen, updates } = req.body;

  if (!pen || !updates) {
    return res.status(400).json({ error: 'PEN and updates are required' });
  }

  try {
    // Fields you want to protect from modification
    const protectedFields = ['pen', 'generalNo', '_id', 'role'];
    protectedFields.forEach(field => delete updates[field]);

    // Update the admin user
    const updatedAdmin = await User.findOneAndUpdate(
      { pen, role: 'admin' }, // filter: must be an admin with this pen
      { $set: updates },       // update data
      { new: true }            // return the updated document
    );

    if (!updatedAdmin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
