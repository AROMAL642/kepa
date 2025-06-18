const express = require('express');
const router = express.Router();
const RepairRequest = require('../models/RepairRequests');

// 🔧 GET only approved repair requests (for mechanic)
router.get('/approved', async (req, res) => {
  try {
    const approvedRequests = await RepairRequest.find({ status: 'approved' })
      .sort({ createdAt: -1 });

    res.json(approvedRequests);
  } catch (err) {
    console.error('Error fetching approved repair requests:', err);
    res.status(500).json({ message: 'Failed to fetch approved requests' });
  }
});

module.exports = router;
