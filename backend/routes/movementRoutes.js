const express = require('express');
const router = express.Router();
const VehicleMovement = require('../models/Movement');
const Vehicle = require('../models/Vehicle'); // import vehicle model

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
    // ✅ Check if vehicleno exists in vehicles collection by matching `number` field
    const validVehicle = await Vehicle.findOne({ number: vehicleno.trim() });
    if (!validVehicle) {
      return res.status(400).json({ message: 'Enter a valid vehicle number.' });
    }

    // ✅ Check for active movement before proceeding
    const existingVehicle = await VehicleMovement.findOne({ vehicleno });
    if (existingVehicle) {
      const active = existingVehicle.movements.find(mov => mov.status === 'Active');
      if (active) {
        return res.status(400).json({ message: 'Vehicle already has an active movement. Complete it first.' });
      }
    }

    const newMovement = {
      startingkm,
      startingdate,
      startingtime,
      destination,
      purpose,
      pen,
      status: 'Active'
    };

    let vehicle;
    if (!existingVehicle) {
      vehicle = new VehicleMovement({
        vehicleno,
        movements: [newMovement]
      });
    } else {
      vehicle = existingVehicle;
      vehicle.movements.push(newMovement);
    }

    await vehicle.save();

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



  router.get('/active/:vehicleno/:pen', async (req, res) => {
  const { vehicleno, pen } = req.params;

  try {
    const vehicle = await VehicleMovement.findOne({ vehicleno });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const activeMovement = vehicle.movements.find(
      mov => mov.status === 'Active' && mov.pen === pen
    );

    if (activeMovement) {
      return res.status(200).json({ active: true, movement: activeMovement });
    } else {
      return res.status(200).json({ active: false });
    }
  } catch (err) {
    console.error('Error fetching active movement:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
