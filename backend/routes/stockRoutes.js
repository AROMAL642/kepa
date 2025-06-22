const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');
const User = require('../models/User');

// ✅ GET: All stock items with enteredBy as "Name (pen)"
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find().lean();
    const pens = stocks.map(s => s.pen).filter(Boolean);

    const users = await User.find({ pen: { $in: pens } }, 'name pen').lean();
    const userMap = users.reduce((acc, user) => {
      acc[user.pen.trim()] = user;
      return acc;
    }, {});

    const formatted = stocks.map(stock => {
      const u = userMap[stock.pen?.trim()];
      return {
        ...stock,
        enteredBy: u ? `${u.name} (${u.pen})` : stock.pen
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('❌ Error fetching stocks:', err.message);
    res.status(500).send('Server Error');
  }
});

// ✅ POST: Add new stock item
router.post('/', async (req, res) => {
  try {
    const {
      pen,
      itemType,
      itemName,
      serialNo,
      quantity,
      condition,
      status,
      hasWarranty,
      warrantyNumber,
      date
    } = req.body;

    if (!pen || !itemType || !itemName || !serialNo || !quantity || !condition || !status || hasWarranty === undefined || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newStock = new Stock({
      pen,
      itemType,
      itemName,
      serialNo,
      quantity,
      condition,
      status,
      hasWarranty,
      warrantyNumber,
      date
    });

    const saved = await newStock.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Failed to add stock:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ PUT: Update stock item by ID
router.put('/:id', async (req, res) => {
  try {
    console.log("🛠️ PUT request received");
    console.log("➡️ ID:", req.params.id); // 👈 Add this
    console.log("📦 Data:", req.body);     // 👈 Add this

    const updatedStock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStock) return res.status(404).send('Stock not found');
    res.json(updatedStock);
  } catch (err) {
    console.error('❌ Error updating stock:', err.message); // 👈 Add this
    res.status(500).send('Server Error');
  }
});

// ✅ DELETE: Delete stock item by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Stock.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send('Stock not found');
    res.send('Deleted successfully');
  } catch (err) {
    console.error('❌ Error deleting stock:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
