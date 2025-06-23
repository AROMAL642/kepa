const express = require('express');
const router = express.Router();
const Trainee = require('../models/Trainee');

// POST: Add new trainee
router.post('/add', async (req, res) => {
  try {
    const {
      cadetNo, name, hasLicense, licenseType,
      licenseNumber, licenseValidity, dob,
      gender, address, company, joiningDate
    } = req.body;

    const newTrainee = new Trainee({
      cadetNo,
      name,
      hasLicense,
      licenseType: hasLicense === 'Yes' ? licenseType : [],
      licenseNumber: hasLicense === 'Yes' ? licenseNumber : '',
      licenseValidity: hasLicense === 'Yes' ? licenseValidity : null,
      dob,
      gender,
      address,
      company,
      joiningDate
    });

    const saved = await newTrainee.save();
    res.status(201).json({ message: 'Trainee saved', trainee: saved });
  } catch (err) {
    console.error('Error adding trainee:', err);
    res.status(500).json({ message: 'Failed to save trainee', error: err.message });
  }
});
//get all trainee
router.get('/all', async (req, res) => {
  try {
    const trainees = await Trainee.find().sort({ createdAt: -1 }).lean();
    
 
    const formattedTrainees = trainees.map(t => ({
      cadetNo: t.cadetNo || '',
      name: t.name || '',
      hasLicense: t.hasLicense || 'No',
      licenseType: Array.isArray(t.licenseType) ? t.licenseType : [],
      licenseNumber: t.licenseNumber || '',
      licenseValidity: t.licenseValidity || null,
      dob: t.dob || null,
      gender: t.gender || '',
      address: t.address || '',
      company: t.company || '',
      joiningDate: t.joiningDate || null,
      _id: t._id
    }));
    
    res.status(200).json(formattedTrainees);
  } catch (err) {
    console.error('Error fetching trainees:', err);
    res.status(500).json({ message: 'Error fetching trainees', error: err.message });
  }
});

module.exports = router;
