// for validate vehicle number


const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

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

module.exports = router;