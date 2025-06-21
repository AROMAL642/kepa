const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const multer = require('multer');

// Use multer memory storage to keep files in memory (not saved to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Accept file uploads in memory
router.post(
  '/',
  upload.fields([
    { name: 'insuranceFile', maxCount: 1 },
    { name: 'pollutionFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { number } = req.body;

      const existingVehicle = await Vehicle.findOne({ number: number.toUpperCase() });
      if (existingVehicle) {
        return res.status(400).json({ error: 'Vehicle number already exists' });
      }

      const newVehicle = new Vehicle({
        ...req.body,
        number: number.toUpperCase(),
        insuranceFile: req.files?.insuranceFile?.[0]
          ? {
              data: req.files.insuranceFile[0].buffer,
              contentType: req.files.insuranceFile[0].mimetype,
              originalName: req.files.insuranceFile[0].originalname,
            }
          : undefined,
        pollutionFile: req.files?.pollutionFile?.[0]
          ? {
              data: req.files.pollutionFile[0].buffer,
              contentType: req.files.pollutionFile[0].mimetype,
              originalName: req.files.pollutionFile[0].originalname,
            }
          : undefined,
      });

      await newVehicle.save();
      res.status(201).json({ message: 'Vehicle added successfully' });
    } catch (error) {
      console.error('Error adding vehicle:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
