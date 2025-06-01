// routes/searchVehicle.js
const express = require('express');
const router = express.Router();
const Register = require('../models/Vehicle');

router.get('/', async (req, res) => {
  try {
    const { number } = req.query;

    if (!number) {
      return res.status(400).json({ error: 'Vehicle number is required' });
    }

    const vehicle = await Register.findOne({ number: number });
    console.log('Vehicle found:', vehicle); 

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
