const express = require('express');
const router = express.Router();
const multer = require('multer');
const VehicleFuel = require('../models/Fuel');
const Vehicle = require('../models/Vehicle');

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// POST route to save fuel entry
// POST route to save fuel entry
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const requiredFields = [
      'vehicleNo', 'pen', 'presentKm',
      'quantity', 'amount', 'date', 'billNo', 'fullTank', 'fuelType'
    ];

    // Check for missing fields
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    // Extract data from request
    const {
      vehicleNo, pen, firmName, presentKm,
      quantity, amount, kmpl, date,
      billNo, fullTank, fuelType
    } = req.body;

    // Get the latest entry's presentKm to set as previousKm
    const latestVehicle = await VehicleFuel.findOne({ vehicleNo });

    let previousKm = 0;
    if (latestVehicle && latestVehicle.fuelEntries.length > 0) {
      // Sort by date and then by _id (Mongo ObjectID has timestamp ordering)
const sortedEntries = [...latestVehicle.fuelEntries].sort((a, b) => {
  const dateDiff = new Date(b.date) - new Date(a.date);
  if (dateDiff !== 0) return dateDiff;
  return b._id.toString().localeCompare(a._id.toString()); // fallback to ObjectId order
});

      previousKm = sortedEntries[0].presentKm;
    }

    // Create new or fetch existing vehicle fuel record
    let vehicleFuel = latestVehicle;
    if (!vehicleFuel) {
      vehicleFuel = new VehicleFuel({
        vehicleNo,
        fuelEntries: []
      });
    }

    // Build new fuel entry
    const newEntry = {
      pen,
      firmName,
      presentKm: Number(presentKm),
      quantity: Number(quantity),
      amount: Number(amount),
      previousKm,
      kmpl: Number(kmpl || 0),
      date: new Date(date),
      billNo,
      fullTank: fullTank === 'yes' || fullTank === true || fullTank === 'true',
      fuelType,
      status: 'pending'
    };

    if (req.file) {
      newEntry.file = req.file.buffer;
      newEntry.fileType = req.file.mimetype;
    }

    // Save the new entry
    vehicleFuel.fuelEntries.push(newEntry);
    await vehicleFuel.save();

    res.status(201).json({
      success: true,
      message: 'Fuel entry saved successfully',
      vehicleNo,
      previousKm,
      entryId: vehicleFuel.fuelEntries[vehicleFuel.fuelEntries.length - 1]._id
    });

  } catch (error) {
    console.error('Error saving fuel entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save fuel entry',
      error: error.message
    });
  }
});


// GET previousKm for a vehicle
router.get('/previousKm/:vehicleNo', async (req, res) => {
  try {
    const { vehicleNo } = req.params;

    const latestKmDoc = await VehicleFuel.aggregate([
      { $match: { vehicleNo } },
      { $unwind: '$fuelEntries' },
      { $sort: { 'fuelEntries.date': -1 } },
      { $limit: 1 },
      { $project: { presentKm: '$fuelEntries.presentKm' } }
    ]);

    const previousKm = latestKmDoc.length ? latestKmDoc[0].presentKm : 0;

    res.status(200).json({ success: true, previousKm });
  } catch (error) {
    console.error('Error fetching previousKm:', error);
    res.status(500).json({ success: false, message: 'Error fetching previous km', error: error.message });
  }
});

// GET all fuel entries for a specific vehicle
router.get('/vehicle/:vehicleNo', async (req, res) => {
  try {
    const vehicleFuel = await VehicleFuel.findOne({ vehicleNo: req.params.vehicleNo });

    if (!vehicleFuel) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      vehicleNo: vehicleFuel.vehicleNo,
      entries: vehicleFuel.fuelEntries
    });

  } catch (error) {
    console.error('Error fetching fuel entries:', error);
    res.status(500).json({ success: false, message: 'Error fetching fuel entries', error: error.message });
  }
});

// GET all vehicles with fuel entries and fuel type
router.get('/', async (req, res) => {
  try {
    const vehiclesRaw = await VehicleFuel.find().sort({ vehicleNo: 1 });

    const vehicleNos = vehiclesRaw.map(v => v.vehicleNo);
    const fuelTypesMap = {};

    const vehiclesInfo = await Vehicle.find({ number: { $in: vehicleNos } });
    vehiclesInfo.forEach(v => {
      fuelTypesMap[v.number] = v.fuelType;
    });

    const vehicles = vehiclesRaw.map(vehicle => {
      const fuelEntries = vehicle.fuelEntries.map(entry => ({
        ...entry.toObject(),
        file: entry.file ? entry.file.toString('base64') : null,
        fileType: entry.fileType || null,
        fuelType: fuelTypesMap[vehicle.vehicleNo] || 'Unknown'
      }));

      return {
        _id: vehicle._id,
        vehicleNo: vehicle.vehicleNo,
        fuelEntries
      };
    });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles
    });

  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, message: 'Error fetching vehicles', error: error.message });
  }
});

// Validate vehicle number
router.get('/validate-vehicle/:vehicleNo', async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ number: req.params.vehicleNo });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      vehicle: {
        number: vehicle.number,
        model: vehicle.model,
        fuelType: vehicle.fuelType
      }
    });
  } catch (error) {
    console.error('Vehicle validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating vehicle',
      error: error.message
    });
  }
});

// Update fuel entry status (approve/reject)
router.put('/:vehicleNo/:entryId', async (req, res) => {
  const { vehicleNo, entryId } = req.params;
  const { status } = req.body;

  try {
    const vehicleFuel = await VehicleFuel.findOne({ vehicleNo });

    if (!vehicleFuel) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const entry = vehicleFuel.fuelEntries.id(entryId);

    if (!entry) {
      return res.status(404).json({ message: 'Fuel entry not found' });
    }

    entry.status = status.toLowerCase();
    await vehicleFuel.save();

    res.status(200).json({ message: 'Status updated successfully', entry });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
