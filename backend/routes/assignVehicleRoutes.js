const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

// Search users with role = 'user' by name or PEN
router.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const users = await User.find(
      {
        role: 'user',
        verified: 'YES',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { pen: query }
        ]
      },
      {
        name: 1,
        pen: 1,
        phone: 1,
        photo: 1
      }
    );

    const usersWithVehicle = await Promise.all(users.map(async (user) => {
      const vehicle = await Vehicle.findOne({ currentDriver: user.pen }, { number: 1 });
      return {
        ...user._doc,
        assignedVehicle: vehicle ? vehicle.number : null,
        assignStatus: vehicle ? 'Assigned' : 'Not Assigned'
      };
    }));

    res.status(200).json(usersWithVehicle);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});





router.get('/vehicle/search', async (req, res) => {
  const query = req.query.q;
  try {
    const vehicles = await Vehicle.find({ number: { $regex: query, $options: 'i' } });
    res.json(vehicles);
  } catch (error) {
    console.error('Search vehicle error:', error);
    res.status(500).json({ error: 'Vehicle search failed' });
  }
});






// PATCH /api/vehicles/assign
router.patch('/assign', async (req, res) => {
  const { vehicleNumber, pen } = req.body;

  try {
    const upperCaseVehicleNumber = vehicleNumber.toUpperCase();

    // Step 1: Unassign this PEN from any existing vehicle
    await Vehicle.updateMany(
      { currentDriver: pen },
      { $unset: { currentDriver: "" } }
    );

    // Step 2: Assign the new vehicle
    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { number: upperCaseVehicleNumber },
      { currentDriver: pen },
      { new: true }
    );

    if (!updatedVehicle) return res.status(404).json({ error: 'Vehicle not found' });

    res.json({ message: 'Vehicle assigned successfully', vehicle: updatedVehicle });
  } catch (error) {
    console.error('Assign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
