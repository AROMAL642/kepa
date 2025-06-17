const express = require('express');
const router = express.Router();
const multer = require('multer');
const VehicleFuel = require('../models/Fuel');
const Vehicle = require('../models/Vehicle'); // ✅ Import Vehicle model


const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// POST route to save fuel entry
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const requiredFields = [
      'vehicleNo', 'pen', 'presentKm', 
      'quantity', 'amount', 'date', 'billNo', 'fullTank'
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ 
          success: false,
          message: `Missing required field: ${field}` 
        });
      }
    }

    const {
      vehicleNo, pen, firmName, presentKm, quantity,
      amount, previousKm, kmpl, date, billNo, fullTank
    } = req.body;

    let vehicleFuel = await VehicleFuel.findOne({ vehicleNo });

    if (!vehicleFuel) {
      vehicleFuel = new VehicleFuel({ 
        vehicleNo, 
        fuelEntries: [] 
      });
    }

    const newEntry = {
      pen,
      firmName,
      presentKm: Number(presentKm),
      quantity: Number(quantity),
      amount: Number(amount),
      previousKm: Number(previousKm || 0),
      kmpl: Number(kmpl || 0),
      date: new Date(date),
      billNo,
      fullTank,
      status: 'pending'
    };

    if (req.file) {
      newEntry.file = req.file.buffer;
      newEntry.fileType = req.file.mimetype;
    }

    vehicleFuel.fuelEntries.push(newEntry);
    await vehicleFuel.save();

    res.status(201).json({ 
      success: true,
      message: 'Fuel entry saved successfully',
      vehicleNo,
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

// GET previousKm
router.get('/previousKm/:vehicleNo', async (req, res) => {
  try {
    const vehicleFuel = await VehicleFuel.findOne({ 
      vehicleNo: req.params.vehicleNo 
    });

    let previousKm = 0;

    if (vehicleFuel && vehicleFuel.fuelEntries.length > 0) {
      const sortedEntries = [...vehicleFuel.fuelEntries].sort((a, b) => b.date - a.date);
      previousKm = sortedEntries[0].presentKm;
    }

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

// GET all vehicles (with fuel entries)
router.get('/', async (req, res) => {
  try {
    const vehiclesRaw = await VehicleFuel.find().sort({ vehicleNo: 1 });

const vehicles = vehiclesRaw.map(vehicle => {
  const fuelEntries = vehicle.fuelEntries.map(entry => {
    return {
      ...entry.toObject(),
      file: entry.file ? entry.file.toString('base64') : null,
      fileType: entry.fileType || null
    };
  });

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
    const vehicle = await Vehicle.findOne({ 
      number: req.params.vehicleNo 
    });
    
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


// update status bu fuel section
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

    entry.status = status.toLowerCase(); // enforce lowercase: 'approved' / 'rejected'
    await vehicleFuel.save();

    res.status(200).json({ message: 'Status updated successfully', entry });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


module.exports = router;
