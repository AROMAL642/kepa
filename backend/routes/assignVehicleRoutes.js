const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Search users with role = 'user' by name or PEN
router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    // Case-insensitive search on name or exact match on pen
    const users = await User.find(
      {
        role: 'user',
        verified: 'YES',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { pen: query }
        ]
      },
      {
        name: 1,
        pen: 1,
        phone: 1,
        photo: 1
      }
    );

    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
