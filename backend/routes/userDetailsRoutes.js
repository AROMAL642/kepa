const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all verified users (role=user, verified=YES)
router.get('/verified-users', async (req, res) => {
  try {
    const users = await User.find(
      { verified: 'YES' },
      { 
        name: 1, 
        pen: 1, 
        generalNo: 1, 
        phone: 1, 
        email: 1,
        photo: 1,
        signature: 1,
        dob: 1,
        licenseNo: 1,
        bloodGroup: 1,
        gender: 1,
        role: 1 
      }
    ).lean();
    
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching verified users:', err);
    res.status(500).json({ message: 'Error fetching verified users', error: err.message });
  }
});
// Get full user details by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = {
      name: user.name,
      pen: user.pen,
      generalNo: user.generalNo,
      phone: user.phone,
      email: user.email,
      dob: user.dob,
      licenseNo: user.licenseNo,
      bloodGroup: user.bloodGroup,
      gender: user.gender,
      photo: user.photo,
      signature: user.signature,
      role: user.role  
    };
    
    res.status(200).json(userData);
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ message: 'Error fetching user details', error: err.message });
  }
});


// Update user role
router.put('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ message: 'Error updating user role', error: err.message });
  }
});



// DELETE user by PEN number
router.delete('/pen/:pen', async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ pen: req.params.pen });
    if (!deletedUser) {
      return res.status(404).json({ message: 'User with specified PEN not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user by PEN:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;