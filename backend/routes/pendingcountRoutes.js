const express = require('express');
const router = express.Router();
const RepairRequests = require('../models/RepairRequests');

// GET /api/repair/pending/totalcount
router.get('/repair/pending/totalcount', async (req, res) => {
  try {
    const count = await RepairRequests.countDocuments({
      status: { $in: ['pending', 'sent_to_MTI', 'for_generating_certificate'] }
    });
    res.json({ count });
  } catch (err) {
    console.error('Error fetching pending/total repair count:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
