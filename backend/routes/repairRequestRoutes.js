const express = require('express');
const router = express.Router();
const multer = require('multer');           //  Import multer
const path = require('path');               //  Import path
const fs = require('fs');                   //  Import fs
const RepairRequest = require('../models/RepairRequest');


// 1. Submit new repair request
router.post('/', async (req, res) => {
  try {
    console.log('Incoming request:', req.body); //  LOG

    const { appNo, vehicleNo, subject, description } = req.body;

    if (!appNo || !vehicleNo || !subject || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newRequest = new RepairRequest({
      appNo,
      vehicleNo,
      subject,
      description,
      date: new Date(), 
    });

    const savedRequest = await newRequest.save();
    console.log('Saved request:', savedRequest); //  LOG

    res.status(201).json({ message: 'Repair request submitted', requestId: savedRequest._id });
  } catch (err) {
    console.error('Error saving request:', err); //  LOG
    res.status(500).json({ message: 'Internal server error' });
  }
});


// 2. Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // ✅ Max 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed'));
    }
  }
});

// 3. Upload bill for a repair request
router.post('/:id/upload-bill', upload.single('bill'), async (req, res) => {
  try {
    const requestId = req.params.id;
    const billFile = req.file?.filename;

    const updated = await RepairRequest.findByIdAndUpdate(
      requestId,
      { bill: billFile },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Repair request not found' });

    res.status(200).json({ message: 'Bill uploaded successfully', bill: billFile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload bill', error: err.message });
  }
});

module.exports = router;
