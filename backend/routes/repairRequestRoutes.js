const express = require('express');
const router = express.Router();
const multer = require('multer');
const RepairRequest = require('../models/RepairRequests');
const User = require('../models/User'); 



// Configure multer for memory storage (buffer, not disk)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Max 5 MB
});

// ✅ POST: Create new repair request
router.post('/', upload.single('billFile'), async (req, res) => {
  try {
    const { vehicleNo, pen, date, subject, description } = req.body;

    const repairData = {
      vehicleNo,
      pen,
      date,
      subject,
      description,
      status: 'pending',
      
    };

    // newly added delete

    const user = await User.findOne({ pen });
    if (!user) {
  return res.status(400).json({ message: `No user found with PEN ${pen}` });
}











    if (req.file) {
      repairData.billFile = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const newRepair = new RepairRequest(repairData);
    await newRepair.save();

    res.status(201).json({ message: 'Repair request submitted successfully' });
  } catch (err) {
    console.error('Error saving repair request:', err);
    res.status(500).json({ message: 'Failed to submit repair request' });
  }
});

// ✅ GET: Get all repair requests
router.get('/', async (req, res) => {
  try {
    const repairs = await RepairRequest.find();
    const formattedRepairs = repairs.map(req => ({
      _id: req._id,
      vehicleNo: req.vehicleNo,
      pen: req.pen,
      date: req.date,
      subject: req.subject,
      description: req.description,
      status: req.status || 'pending',
      billFile: req.billFile?.data
        ? {
            data: req.billFile.data.toString('base64'),
            contentType: req.billFile.contentType
          }
        : null
    }));

    res.json(formattedRepairs);
  } catch (err) {
    console.error('Error fetching repair requests:', err);
    res.status(500).json({ message: 'Failed to fetch repair requests' });
  }
});

// ✅ PUT: Update repair request status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await RepairRequest.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Repair request not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('PUT /status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
