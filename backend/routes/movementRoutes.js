const express = require('express');
const router = express.Router();
const MovementRegister = require('../models/Movement');
const Vehicle = require('../models/Vehicle');

// POST endpoint to save movement data
router.post('/', async (req, res) => {
  try {
    // Create new movement record
    const newMovement = new MovementRegister(req.body);
    await newMovement.save();

    // Update vehicle's current status
    await Vehicle.findOneAndUpdate(
      { vehicleNo: req.body.vehicleno },
      { 
        currentStatus: 'On Trip',
        lastTripStart: new Date(),
        currentDriver: req.body.pen
      }
    );

    res.status(201).json({ 
      message: 'Movement registered successfully',
      movementId: newMovement._id 
    });
  } catch (error) {
    console.error('Error saving movement:', error);
    res.status(500).json({ 
      message: 'Failed to register movement',
      error: error.message 
    });
  }
});

module.exports = router;