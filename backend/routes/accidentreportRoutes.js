const express = require('express');
const router = express.Router();
const multer = require('multer');
const Accident = require('../models/Accident');


const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Max 5 MB
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { vehicleNo, pen, accidentTime, location, description } = req.body;

    const accidentData = {
      vehicleNo,
      pen,
      accidentTime,
      location,
      description
    };

    if (req.file) {
      accidentData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const newAccident = new Accident(accidentData);
    await newAccident.save();

    res.status(201).json({ message: 'Accident report saved successfully' });
  } catch (err) {
    console.error('Error saving accident report:', err);
    res.status(500).json({ message: 'Failed to save accident report' });
  }
});
//get accident report for admin
router.get('/', async (req, res) => {
  try {
    const reports = await Accident.find().select('-image'); // exclude image if not needed
    res.json(reports);
  } catch (err) {
    console.error('Error fetching accident reports:', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});


//get accident report for admin


router.get('/', async (req, res) => {
  try {
    const accidents = await Accident.find();
    res.json(accidents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch accidents' });
  }
});

module.exports = router;


module.exports = router;
