// for validate vehicle number


const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });


// Get all vehicle numbers for validation
router.get('/numbers', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}, 'number');
    res.status(200).json({
      success: true,
      vehicles: vehicles.map(v => v.number)
    });
  } catch (error) {
    console.error('Error fetching vehicle numbers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle numbers',
      error: error.message
    });
  }
});
//Vlidate Vehicle number

router.get('/check/:vehicleno', async (req, res) => {
  try {
    const vehicleNo = req.params.vehicleno.toUpperCase(); // normalize input
    const vehicle = await Vehicle.findOne({ number: vehicleNo });

    if (vehicle) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error checking vehicle:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/data/:vehicleno', async (req, res) => {
  const { vehicleno } = req.params;

  try {
    const vehicle = await Vehicle.findOne({ number: vehicleno });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({ vehicle });
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
//update certificates

router.post('/update-certificates', upload.fields([
  { name: 'insuranceFile', maxCount: 1 },
  { name: 'pollutionFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      vehicleNo,
      insurancePolicyNo,
      insuranceValidity,
      pollutionValidity
    } = req.body;

    if (!vehicleNo) {
      return res.status(400).json({ message: 'Vehicle number is required.' });
    }

    const vehicle = await Vehicle.findOne({ number: vehicleNo });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    // Update basic fields if provided
    if (insurancePolicyNo) vehicle.insurancePolicyNo = insurancePolicyNo;
    if (insuranceValidity) vehicle.insuranceValidity = new Date(insuranceValidity);
    if (pollutionValidity) vehicle.pollutionValidity = new Date(pollutionValidity);

    // Update insurance file if uploaded
    if (req.files.insuranceFile) {
      const file = req.files.insuranceFile[0];
      vehicle.insuranceFile = {
        data: file.buffer,
        contentType: file.mimetype,
        originalName: file.originalname
      };
    }

    // Update pollution file if uploaded
    if (req.files.pollutionFile) {
      const file = req.files.pollutionFile[0];
      vehicle.pollutionFile = {
        data: file.buffer,
        contentType: file.mimetype,
        originalName: file.originalname
      };
    }

    await vehicle.save();
    res.status(200).json({ message: 'Vehicle certificate details updated successfully.' });

  } catch (error) {
    console.error('Error updating certificates:', error);
    res.status(500).json({ message: 'Server error while updating certificates.' });
  }
});




module.exports = router;