const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle'); // Ensure the correct model is imported

// Helper to convert Buffer to base64
const bufferToBase64 = (buffer) => {
  return buffer?.toString('base64') || null;
};

// 🔍 GET /searchvehicle?number=KL08AB1234
// GET /searchvehicle?number=KL01AB1234
router.get('/searchvehicle', async (req, res) => {
  try {
    const { number } = req.query;

    const vehicle = await Vehicle.findOne({ number });

    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Extract latest certificate entry if exists
    const latestCert = vehicle.certificateHistory?.[vehicle.certificateHistory.length - 1];

    res.json({
      number: vehicle.number,
      type: vehicle.type,
      model: vehicle.model,
      fuelType: vehicle.fuelType,
      status: vehicle.status,
      arrivedDate: vehicle.arrivedDate,
      insurancePolicyNo: latestCert?.insurancePolicyNo || null,
      insuranceValidity: latestCert?.insuranceValidity || null,
      insuranceFile: latestCert?.insuranceFile
        ? {
            buffer: latestCert.insuranceFile.data.toString('base64'),
            mimetype: latestCert.insuranceFile.contentType
          }
        : null,
      pollutionCertificateNo: latestCert?.pollutionCertificateNo || null,
      pollutionValidity: latestCert?.pollutionValidity || null,
      pollutionFile: latestCert?.pollutionFile
        ? {
            buffer: latestCert.pollutionFile.data.toString('base64'),
            mimetype: latestCert.pollutionFile.contentType
          }
        : null
    });

  } catch (err) {
    console.error('Error fetching vehicle details:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// 📃 GET /vehicles (Optimized - excludes binary fields)
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}, {
      insuranceFile: 0,
      pollutionFile: 0
    });

    res.status(200).json(vehicles);
  } catch (err) {
    console.error('Error fetching vehicle list:', err);
    res.status(500).json({ error: 'Failed to fetch vehicle list' });
  }
});

// ❌ DELETE /vehicles/:id
router.delete('/vehicles/:id', async (req, res) => {
  try {
    const result = await Vehicle.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).send('Vehicle not found');
    res.send({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// 🔄 PUT /vehicles/:id/status
router.put('/vehicles/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedVehicle) return res.status(404).send('Vehicle not found');
    res.json(updatedVehicle);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
