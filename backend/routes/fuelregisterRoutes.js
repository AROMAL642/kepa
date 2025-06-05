const express = require('express');
const router = express.Router();
const multer = require('multer');
const FuelRegister = require('../models/Fuel'); // your Mongoose model

// Use memory storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST route to save fuel entry
router.post('/fuel', upload.single('file'), async (req, res) => {
  const {
  vehicleNo, pen, firmName, presentKm, quantity,
  amount, previousKm, kmpl, date, billNo, fullTank
} = req.body;


  try {
    const newFuelEntry = new FuelRegister({
      vehicleNo,
      pen,
      firmName,
      presentKm,
      quantity,
      amount,
      previousKm,
      kmpl,
      date,
      billNo,
      fullTank,
      file: req.file ? req.file.buffer : null,
      fileType: req.file ? req.file.mimetype : null
    });

    await newFuelEntry.save();

    res.status(200).json({ message: 'Fuel entry saved successfully' });
  } catch (error) {
    console.error('Error saving fuel entry:', error);
    res.status(500).json({ message: 'Failed to save fuel entry', error });
  }
});




// GET route to fetch latest previousKm for a given vehicleNo
router.get('/fuel/previousKm/:vehicleNo', async (req, res) => {
  const { vehicleNo } = req.params;

  try {
    const latestEntry = await FuelRegister.findOne({ vehicleNo })
      .sort({ date: -1 });

    if (latestEntry) {
      res.status(200).json({ previousKm: latestEntry.presentKm });
    } else {
      res.status(200).json({ previousKm: 0 });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching previousKm', error });
  }
});


router.get('/fuel', async (req, res) => {
  const fuelEntries = await FuelRegister.find().sort({ date: -1 });
  res.json(fuelEntries);
});

module.exports = router;
