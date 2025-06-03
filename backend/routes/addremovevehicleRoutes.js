const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle'); // lowercase filename as per your structure

router.post('/', async (req, res) => {
  try {
    const { number } = req.body;

    const existingVehicle = await Vehicle.findOne({ number: number.toUpperCase() });
    if (existingVehicle) {
      return res.status(400).json({ error: 'Vehicle number already exists' });
    }

    const newVehicle = new Vehicle({ ...req.body, number: number.toUpperCase() });
    await newVehicle.save();
    res.status(201).json({ message: 'Vehicle added successfully' });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
