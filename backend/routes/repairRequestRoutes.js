

const express = require('express');
const router = express.Router();
const multer = require('multer');
const RepairRequest = require('../models/RepairRequests');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('billFile'), async (req, res) => {
  try {



    console.log('📥 Incoming repair request:');
    console.log('Body:', req.body);
    console.log('File:', req.file);


    const { date, vehicleNo, subject, description, pen } = req.body;
    const file = req.file;

    const newRequest = new RepairRequest({
      date,
      vehicleNo,
      subject,
      description,
      pen,
      status: 'pending',
      billFile: file
        ? {
            data: file.buffer,
            contentType: file.mimetype,
            filename: file.originalname
          }
        : undefined
    });

    await newRequest.save();
    res.status(201).json({ message: 'Repair request submitted successfully' });
  } catch (error) {
    console.error('❌ Failed to save repair request:', error);
    res.status(500).json({ message: 'Failed to save repair request', error: error.message });
  }
});

module.exports = router;
