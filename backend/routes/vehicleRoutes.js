const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all vehicle numbers
router.get('/numbers', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}, 'number');
    res.status(200).json({
      success: true,
      vehicles: vehicles.map(v => v.number)
    });
  } catch (error) {
    console.error('Error fetching vehicle numbers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// VALIDATE a single vehicle number
router.get('/check/:vehicleno', async (req, res) => {
  try {
    const vehicleNo = req.params.vehicleno.toUpperCase();
    const exists = await Vehicle.exists({ number: vehicleNo });
    res.json({ exists: !!exists });
  } catch (err) {
    console.error('Error checking vehicle:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// FETCH full vehicle data (including certificateHistory)
router.get('/data/:vehicleno', async (req, res) => {
  try {
    const vehicleno = req.params.vehicleno.toUpperCase();
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

router.post('/update-certificates', upload.fields([
  { name: 'insuranceFile', maxCount: 1 },
  { name: 'pollutionFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      vehicleNo,
      insurancePolicyNo,
      insuranceValidity,
      insuranceExpense,
      pollutionValidity,
      pollutionExpense
    } = req.body;

    if (!vehicleNo) return res.status(400).json({ message: 'Vehicle number is required.' });

    const vehicle = await Vehicle.findOne({ number: vehicleNo });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });

    const lastCert = vehicle.certificateHistory?.[vehicle.certificateHistory.length - 1] || {};

    const newCert = {
      insurancePolicyNo: insurancePolicyNo || lastCert.insurancePolicyNo,
      insuranceValidity: insuranceValidity ? new Date(insuranceValidity) : lastCert.insuranceValidity,
      insuranceExpense: insuranceExpense ? Number(insuranceExpense) : lastCert.insuranceExpense,
      pollutionValidity: pollutionValidity ? new Date(pollutionValidity) : lastCert.pollutionValidity,
      pollutionExpense: pollutionExpense ? Number(pollutionExpense) : lastCert.pollutionExpense,
      insuranceFile: lastCert.insuranceFile,
      pollutionFile: lastCert.pollutionFile,
      updatedAt: new Date()
    };

    if (req.files.insuranceFile) {
      const file = req.files.insuranceFile[0];
      newCert.insuranceFile = {
        data: file.buffer,
        contentType: file.mimetype,
        originalName: file.originalname
      };
    }

    if (req.files.pollutionFile) {
      const file = req.files.pollutionFile[0];
      newCert.pollutionFile = {
        data: file.buffer,
        contentType: file.mimetype,
        originalName: file.originalname
      };
    }

    vehicle.certificateHistory.push(newCert);
    await vehicle.save();

    res.status(200).json({ message: 'Certificates updated successfully!' });

  } catch (error) {
    console.error('Error updating certificates:', error);
    res.status(500).json({ message: 'Server error while updating certificates.' });
  }
});

module.exports = router;
