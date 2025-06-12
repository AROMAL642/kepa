// routes/searchVehicle.js

const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle'); // Ensure the correct model is imported

// GET /searchvehicle?number=KL08AB1234
router.get('/searchvehicle', async (req, res) => {
  try {
    const number = req.query.number?.toUpperCase();
    if (!number) return res.status(400).json({ error: 'Vehicle number is required' });

    const vehicle = await Vehicle.findOne({ number });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    res.status(200).json(vehicle);
  } catch (error) {
    console.error('Error searching vehicle:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (err) {
    console.error('Error fetching vehicle list:', err);
    res.status(500).json({ error: 'Failed to fetch vehicle list' });
  }
});

//delete vehicle
router.delete('/vehicles/:id', async (req, res) => {
  try {
    const result = await Vehicle.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).send('Vehicle not found');
    res.send({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// PUT /vehicles/:id/status
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
