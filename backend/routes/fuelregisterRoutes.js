const express = require('express');
const router = express.Router();
const multer = require('multer');
const VehicleFuel = require('../models/Fuel');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User'); 

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Utility: pick only necessary fields
const mapFuelEntry = (entry) => ({
  _id: entry._id,
  pen: entry.pen,
  firmName: entry.firmName,
  presentKm: entry.presentKm,
  quantity: entry.quantity,
  amount: entry.amount,
  previousKm: entry.previousKm,
  kmpl: entry.kmpl,
  date: entry.date,
  billNo: entry.billNo,
  fullTank: entry.fullTank,
  fuelType: entry.fuelType,
  status: entry.status,
  file: entry.file ? entry.file.toString('base64') : null,
  fileType: entry.fileType || null,
});

// POST /api/fuel
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const requiredFields = ['vehicleNo', 'pen', 'presentKm', 'quantity', 'amount', 'date', 'billNo', 'fullTank', 'fuelType'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
      }
    }

    const { vehicleNo, pen, firmName, presentKm, quantity, amount, kmpl, date, billNo, fullTank, fuelType } = req.body;
    const latestVehicle = await VehicleFuel.findOne({ vehicleNo });
    let previousKm = 0;

    if (latestVehicle?.fuelEntries?.length > 0) {
      const sorted = [...latestVehicle.fuelEntries].sort((a, b) => new Date(b.date) - new Date(a.date) || b._id.toString().localeCompare(a._id.toString()));
      previousKm = sorted[0].presentKm;
    }

    let vehicleFuel = latestVehicle || new VehicleFuel({ vehicleNo, fuelEntries: [] });

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
      fullTank: fullTank === 'yes' || fullTank === 'true' || fullTank === true,
      fuelType,
      status: 'pending',
      file: req.file?.buffer,
      fileType: req.file?.mimetype,
    };

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
    res.status(500).json({ success: false, message: 'Failed to save fuel entry', error: error.message });
  }
});

router.get('/previousKm/:vehicleNo', async (req, res) => {
  try {
    const { vehicleNo } = req.params;
    const result = await VehicleFuel.aggregate([
      { $match: { vehicleNo } },
      { $unwind: '$fuelEntries' },
      { $sort: { 'fuelEntries.date': -1 } },
      { $limit: 1 },
      { $project: { presentKm: '$fuelEntries.presentKm' } }
    ]);
    res.status(200).json({ success: true, previousKm: result[0]?.presentKm || 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching previous km', error: error.message });
  }
});

router.get('/vehicle/:vehicleNo', async (req, res) => {
  try {
    const vehicleFuel = await VehicleFuel.findOne({ vehicleNo: req.params.vehicleNo });
    if (!vehicleFuel) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const entries = vehicleFuel.fuelEntries.map(mapFuelEntry);
    res.status(200).json({ success: true, vehicleNo: vehicleFuel.vehicleNo, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching fuel entries', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const vehiclesRaw = await VehicleFuel.find().sort({ vehicleNo: 1 }).lean();
    const vehicleNos = vehiclesRaw.map(v => v.vehicleNo);
    const pens = vehiclesRaw.flatMap(v => v.fuelEntries.map(e => e.pen));
    const uniquePens = [...new Set(pens)];

    const vehicleInfo = await Vehicle.find({ number: { $in: vehicleNos } });
    const fuelTypeMap = Object.fromEntries(vehicleInfo.map(v => [v.number, v.fuelType]));

    const users = await User.find({ pen: { $in: uniquePens } }, 'pen name');
    const penNameMap = Object.fromEntries(users.map(u => [u.pen, u.name]));

    const vehicles = vehiclesRaw.map(vehicle => ({
      _id: vehicle._id,
      vehicleNo: vehicle.vehicleNo,
      fuelEntries: vehicle.fuelEntries.map(e => ({
        ...mapFuelEntry(e),
        fuelType: fuelTypeMap[vehicle.vehicleNo] || 'Unknown',
        nameWithPen: penNameMap[e.pen] ? `${penNameMap[e.pen]} (${e.pen})` : e.pen
      }))
    }));

    res.status(200).json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching vehicles', error: error.message });
  }
});

router.get('/validate-vehicle/:vehicleNo', async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ number: req.params.vehicleNo });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    res.status(200).json({
      success: true,
      vehicle: {
        number: vehicle.number,
        model: vehicle.model,
        fuelType: vehicle.fuelType
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error validating vehicle', error: error.message });
  }
});

router.put('/:vehicleNo/:entryId', async (req, res) => {
  const { vehicleNo, entryId } = req.params;
  const { status } = req.body;

  try {
    const vehicleFuel = await VehicleFuel.findOne({ vehicleNo });
    if (!vehicleFuel) return res.status(404).json({ message: 'Vehicle not found' });

    const entry = vehicleFuel.fuelEntries.id(entryId);
    if (!entry) return res.status(404).json({ message: 'Fuel entry not found' });

    entry.status = status.toLowerCase();
    await vehicleFuel.save();
    res.status(200).json({ message: 'Status updated successfully', entry });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Route to count pending fuel entries
router.get('/fuel-pending-count', async (req, res) => {
  try {
    const allVehicles = await VehicleFuel.find({}, 'fuelEntries');
    
    let pendingCount = 0;
    allVehicles.forEach(vehicle => {
      pendingCount += vehicle.fuelEntries.filter(entry => entry.status === 'pending').length;
    });

    res.status(200).json({ count: pendingCount });
  } catch (err) {
    console.error('Error fetching pending fuel count:', err.message);
    res.status(500).json({ message: 'Error fetching pending fuel count' });
  }
});





module.exports = router;
