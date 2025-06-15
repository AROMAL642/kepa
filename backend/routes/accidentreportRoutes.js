const express = require('express');
const router = express.Router();
const multer = require('multer');
const Accident = require('../models/Accident');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Max 5 MB
});

// POST: Create new accident report
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

// GET: Get all accident reports
router.get('/', async (req, res) => {
  try {
    const accidents = await Accident.find();
    const formattedAccidents = accidents.map(report => ({
      _id: report._id,
      vehicleNo: report.vehicleNo,
      pen: report.pen,
      accidentTime: report.accidentTime,
      location: report.location,
      description: report.description,
      status: report.status,
      image: report.image?.data
        ? {
            data: report.image.data.toString('base64'),
            contentType: report.image.contentType
          }
        : null
    }));

    res.json(formattedAccidents);
  } catch (err) {
    console.error('Error fetching accident reports:', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// ✅ FIXED PUT route: Update accident report status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await Accident.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('PUT /status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
