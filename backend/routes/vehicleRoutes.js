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
//update certificate

router.post('/update-certificates', upload.fields([
  { name: 'insuranceFile' },
  { name: 'pollutionFile' }
]), async (req, res) => {
  try {
    const {
      vehicleNo,
      insurancePolicyNo,
      insuranceValidity,
      insuranceIssuedDate,
      insuranceExpense,
      pollutionCertificateNo,
      pollutionValidity,
      pollutionIssuedDate,
      pollutionExpense
    } = req.body;

    const vehicle = await Vehicle.findOne({ number: vehicleNo });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const insuranceFile = req.files['insuranceFile']?.[0];
    const pollutionFile = req.files['pollutionFile']?.[0];

    const latestCert = vehicle.certificateHistory?.[vehicle.certificateHistory.length - 1];

    const isSamePolicy =
      latestCert &&
      latestCert.insurancePolicyNo === insurancePolicyNo &&
      latestCert.pollutionCertificateNo === pollutionCertificateNo;

    const newCertData = {
      insurancePolicyNo,
      insuranceValidity,
      insuranceIssuedDate,
      insuranceExpense,
      pollutionCertificateNo,
      pollutionValidity,
      pollutionIssuedDate,
      pollutionExpense,
      updatedAt: new Date()
    };

    if (insuranceFile) {
      newCertData.insuranceFile = {
        data: insuranceFile.buffer,
        contentType: insuranceFile.mimetype,
        originalName: insuranceFile.originalname
      };
    }

    if (pollutionFile) {
      newCertData.pollutionFile = {
        data: pollutionFile.buffer,
        contentType: pollutionFile.mimetype,
        originalName: pollutionFile.originalname
      };
    }

    if (isSamePolicy) {
      // Update the existing last entry
      vehicle.certificateHistory[vehicle.certificateHistory.length - 1] = {
        ...latestCert.toObject(),
        ...newCertData
      };
    } else {
      // Add a new entry
      vehicle.certificateHistory.push(newCertData);
    }

    await vehicle.save();
    res.status(200).json({ message: 'Certificate updated successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
