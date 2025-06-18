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
      //user: user._id,
      
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
      //userName: req.user?.name || 'Unknown',
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



// ✅ Mechanic: Get all requests forwarded to them
router.get('/pending', async (req, res) => {
  try {
    const requests = await RepairRequest.find({ status: 'forwarded' });
    res.json(requests);
  } catch (err) {
    console.error('Error fetching forwarded requests:', err);
    res.status(500).json({ message: 'Internal error' });
  }
});

// ✅ Mechanic: View completed / needs work status
router.put('/:id/mechanic-update', async (req, res) => {
  const { workDone, needsParts, partsList, billFile } = req.body;

  try {
    const update = {
      mechanicFeedback: workDone,
      needsParts,
      partsList: needsParts ? partsList : [],
      repairStatus: 'in progress',
      status: needsParts ? 'awaiting_parts_approval' : 'work_done_sent_to_user'
    };

    if (billFile) {
      update.finalBillFile = {
        data: Buffer.from(billFile.data, 'base64'),
        contentType: billFile.contentType
      };
    }

    const result = await RepairRequest.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Mechanic update failed' });
  }
});

// ✅ Mechanic -> Work Done → Send for user verification
router.post('/verify/:id', async (req, res) => {
  try {
    const repair = await RepairRequest.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    repair.status = 'Pending User Verification';
    await repair.save();
    res.json({ message: 'Sent for user verification' });
  } catch (err) {
    console.error('Error in verify route:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Mechanic -> Work Not Done → Notify MTI
router.post('/notify-mti/:id', async (req, res) => {
  try {
    const repair = await RepairRequest.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    repair.status = 'Check Again';
    await repair.save();
    res.json({ message: 'MTI notified to check again' });
  } catch (err) {
    console.error('Error in notify-mti route:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Mechanic completes final repair
router.put('/:id/final-repair-done', async (req, res) => {
  try {
    const result = await RepairRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'final_work_done_sent_to_user' },
      { new: true }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Final repair update failed' });
  }
});

module.exports = router;



