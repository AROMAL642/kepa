const express = require('express');
const router = express.Router();
const multer = require('multer');
const RepairRequest = require('../models/RepairRequests');
const User = require('../models/User');

// Configure multer
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST: Create new repair request
router.post('/', upload.single('billFile'), async (req, res) => {
  try {
    const { vehicleNo, pen, date, subject, description } = req.body;
    const user = await User.findOne({ pen });
    if (!user) return res.status(400).json({ message: `No user found with PEN ${pen}` });

    const repairData = {
      vehicleNo,
      pen,
      date,
      subject,
      description,
      status: 'pending',
      user: user._id
    };

    if (req.file) {
      repairData.billFile = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const newReq = new RepairRequest(repairData);
    await newReq.save();
    res.status(201).json({ message: 'Repair request submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit repair request' });
  }
});

// GET: All repair requests
router.get('/', async (req, res) => {
  const reqs = await RepairRequest.find().populate('user', 'name pen');
  res.json(reqs.map(r => ({
    ...r.toObject(),
    billFile: r.billFile?.data ? {
      data: r.billFile.data.toString('base64'),
      contentType: r.billFile.contentType
    } : null
  })));
});

// PUT: Change request status (admin)
router.put('/:id/status', async (req, res) => {
  const updated = await RepairRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!updated) return res.status(404).json({ message: 'Repair request not found' });
  res.json(updated);
});

// ✅ GET: Mechanic view – treated as "verified" statuses
router.get('/verified', async (req, res) => {
  try {
    const verifiedRequests = await RepairRequest.find({
      status: {
        $in: ['work_done_sent_to_user', 'awaiting_parts_approval', 'final_work_done_sent_to_user']
      }
    }).populate('user', 'name pen');
    res.json(verifiedRequests);
  } catch (err) {
    console.error('Error fetching verified requests:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET: Forwarded to mechanic
router.get('/forwarded', async (req, res) => {
  const requests = await RepairRequest.find({ status: 'forwarded' }).populate('user', 'name pen');
  res.json(requests);
});

// PUT: Mechanic work update
router.put('/:id/mechanic-update', async (req, res) => {
  const { mechanicFeedback, needsParts, partsList, billFile } = req.body;
  const update = {
    mechanicFeedback,
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
});

// POST: Mark done and send for user verification
router.post('/verify/:id', async (req, res) => {
  const r = await RepairRequest.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Repair not found' });
  r.status = 'Pending User Verification';
  await r.save();
  res.json({ message: 'Sent for user verification' });
});

// POST: Mark as needing MTI check
router.post('/notify-mti/:id', async (req, res) => {
  const r = await RepairRequest.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Repair not found' });
  r.status = 'Check Again';
  await r.save();
  res.json({ message: 'MTI notified' });
});

// PUT: Final repair complete
router.put('/:id/final-repair-done', async (req, res) => {
  const r = await RepairRequest.findByIdAndUpdate(req.params.id, { status: 'final_work_done_sent_to_user' }, { new: true });
  res.json(r);
});

module.exports = router;
