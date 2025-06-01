// routes/searchVehicle.js
const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle'); // Ensure correct model filename

router.get('/', async (req, res) => {
  try {
    const { vehicleno } = req.query;

    if (!vehicleno) {
      return res.status(400).json({ error: 'Vehicle number is required' });
    }

    // Match based on the field `number`, not `vehicleno`
    const vehicle = await Vehicle.findOne({ number: vehicleno });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    console.error('Error searching vehicle:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
