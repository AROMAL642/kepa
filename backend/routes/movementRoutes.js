const express = require('express');
const router = express.Router();
const VehicleMovement = require('../models/Movement');

// POST /api/movement/start — Start a movement entry
router.post('/start', async (req, res) => {
  const {
    vehicleno,
    startingkm,
    startingdate,
    startingtime,
    destination,
    purpose,
    pen
  } = req.body;

  if (!vehicleno || !startingkm || !startingdate || !startingtime || !destination || !purpose || !pen) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  try {
    let vehicle = await VehicleMovement.findOne({ vehicleno });

    const newMovement = {
      startingkm,
      startingdate,
      startingtime,
      destination,
      purpose,
      pen,
      status: 'Active'
    };

    if (!vehicle) {
      // If no document for this vehicle, create new
      vehicle = new VehicleMovement({
        vehicleno,
        movements: [newMovement]
      });
    } else {
      // Append to existing movements array
      vehicle.movements.push(newMovement);
    }

    await vehicle.save();

    // Return the index of the movement we just added (for reference)
    const movementIndex = vehicle.movements.length - 1;

    res.status(200).json({
      message: 'Movement saved successfully',
      movementIndex: movementIndex
    });
  } catch (err) {
    console.error('Error saving movement:', err);
    res.status(500).json({ message: 'Server error while saving movement' });
  }
});

module.exports = router;
