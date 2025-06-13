const express = require('express');
const router = express.Router();
const VehicleMovement = require('../models/Movement');
const Vehicle = require('../models/Vehicle'); // Vehicle model

// ✅ Check if vehicle exists in vehicle master (vehicles collection)
router.get('/check/:vehicleno', async (req, res) => {
  try {
    const vehicleno = req.params.vehicleno.trim().toUpperCase();
    const vehicle = await Vehicle.findOne({ number: vehicleno });

    if (!vehicle) {
      return res.status(200).json({ exists: false });
    }

    res.status(200).json({ exists: true });
  } catch (err) {
    console.error('Error checking vehicle number:', err);
    res.status(500).json({ message: 'Server error while checking vehicle number' });
  }
});

//  Start a new movement (with cross-user active check)
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
    const trimmedVehicleno = vehicleno.trim().toUpperCase();

    //  Check vehicle exists in Vehicle collection
    const validVehicle = await Vehicle.findOne({ number: trimmedVehicleno });
    if (!validVehicle) {
      return res.status(400).json({ message: 'Enter a valid vehicle number.' });
    }

    //  Check active movement (any user)
    const existingVehicle = await VehicleMovement.findOne({ vehicleno: trimmedVehicleno });

    if (existingVehicle) {
      const active = existingVehicle.movements.find(mov => mov.status === 'Active');

      if (active) {
        if (active.pen !== pen) {
          return res.status(400).json({
            message: `Vehicle is currently in use by PEN ${active.pen}. Wait to Complete the current movement details by the PEN ${active.pen}.`
          });
        } else {
          return res.status(400).json({
            message: 'You already have an active movement for this vehicle. Please complete it first.'
          });
        }
      }
    }

    // ✅ Create new movement
    const newMovement = {
      startingkm,
      startingdate,
      startingtime,
      destination,
      purpose,
      pen,
      status: 'Active'
    };

    let vehicleMovement;
    if (!existingVehicle) {
      vehicleMovement = new VehicleMovement({
        vehicleno: trimmedVehicleno,
        movements: [newMovement]
      });
    } else {
      vehicleMovement = existingVehicle;
      vehicleMovement.movements.push(newMovement);
    }

    await vehicleMovement.save();

    const movementIndex = vehicleMovement.movements.length - 1;

    res.status(200).json({
      message: 'Movement saved successfully',
      movementIndex
    });
  } catch (err) {
    console.error('Error saving movement:', err);
    res.status(500).json({ message: 'Server error while saving movement' });
  }
});

// Get active movement for vehicle + PEN
router.get('/active/:vehicleno/:pen', async (req, res) => {
  const vehicleno = req.params.vehicleno.trim().toUpperCase();
  const pen = req.params.pen;

  try {
    const vehicle = await VehicleMovement.findOne({ vehicleno });
    if (!vehicle) {
      // Check in master to confirm whether this is a known vehicle at all
      const checkMaster = await Vehicle.findOne({ number: vehicleno });
      if (!checkMaster) {
        return res.status(404).json({ message: 'Vehicle not found in records' });
      } else {
        return res.status(200).json({ active: false });
      }
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



//  End movement and update details
router.put('/end/:vehicleno', async (req, res) => {
  const vehicleno = req.params.vehicleno.trim().toUpperCase();
  const { endingtime, endingkm, officerincharge, endingdate } = req.body;

  if (!endingtime || !endingkm || !officerincharge || !endingdate) {
    return res.status(400).json({ message: 'All end details including ending date are required.' });
  }

  try {
    const vehicleMovement = await VehicleMovement.findOne({ vehicleno });

    if (!vehicleMovement) {
      return res.status(404).json({ message: 'Vehicle movement record not found.' });
    }

    const activeMovement = vehicleMovement.movements.find(mov => mov.status === 'Active');

    if (!activeMovement) {
      return res.status(400).json({ message: 'No active movement found for this vehicle.' });
    }

    // ✅ Update all ending fields
    activeMovement.endingtime = endingtime;
    activeMovement.endingkm = endingkm;
    activeMovement.endingdate = endingdate;
    activeMovement.officerincharge = officerincharge;
    activeMovement.status = 'Completed';

    await vehicleMovement.save();

    res.status(200).json({ message: 'Movement completed successfully.' });
  } catch (err) {
    console.error('Error completing movement:', err);
    res.status(500).json({ message: 'Server error while ending movement.' });
  }
});



// Get all movement data for admin view
router.get('/all', async (req, res) => {
  try {
    const allMovements = await VehicleMovement.aggregate([
      { $unwind: "$movements" }, // Unwind the movements array
      { $sort: { "movements.createdAt": -1 } }, // Sort by creation date (newest first)
      { 
        $project: {
          vehicleno: 1,
          startingkm: "$movements.startingkm",
          startingdate: "$movements.startingdate",
          startingtime: "$movements.startingtime",
          destination: "$movements.destination",
          purpose: "$movements.purpose",
          pen: "$movements.pen",
          officerincharge: "$movements.officerincharge",
          endingkm: "$movements.endingkm",
          endingdate: "$movements.endingdate",
          endingtime: "$movements.endingtime",
          status: "$movements.status",
          createdAt: "$movements.createdAt",
          _id: "$movements._id"
        }
      }
    ]);
    res.status(200).json(allMovements);
  } catch (err) {
    console.error('Error fetching all movements:', err);
    res.status(500).json({ message: 'Server error while fetching movement data' });
  }
});

module.exports = router;
