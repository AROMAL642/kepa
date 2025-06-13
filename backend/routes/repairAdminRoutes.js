const express = require('express');
const router = express.Router();
const RepairRequest = require('../models/RepairRequests');

// ✅ Get all repair requests (admin)
router.get('/', async (req, res) => {
  try {
    const repairs = await RepairRequest.find()
  .populate('user', 'name pen')
  .sort({ createdAt: -1 });

    res.json(repairs);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch repairs' });
  }
});

// ✅ Approve a repair request
router.patch('/:id/approve', async (req, res) => {
  try {
    await RepairRequest.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.json({ message: 'Request approved' });
  } catch (err) {
    res.status(500).json({ error: 'Approval failed' });
  }
});

module.exports = router;
