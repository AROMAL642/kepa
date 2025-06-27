
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Stock = require('../models/Stock');
const User = require('../models/User');

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
  }  catch (err) {
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

    if (
      !pen || !itemType || !itemName || !serialNo || !quantity || !condition || !status || hasWarranty === undefined || !date
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const stockId = 'STK-' + Date.now(); // Generate unique stock ID

    const newStock = new Stock({
      stockId,
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

// ✅ PUT: Update stock item by MongoDB _id
router.put('/byStockId/:stockId', async (req, res) => {
  const { stockId } = req.params;
  try {
    const updated = await Stock.findByIdAndUpdate(stockId, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Stock not found' });
    res.json(updated);
  } catch (err) {
    console.error('Stock update error:', err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});


// ✅ PUT: Update stock item by stockId (like purchaseId)
router.put('/byStockId/:stockId', async (req, res) => {
  try {
    const {
      itemType,
      itemName,
      serialNo,
      quantity,
      condition,
      status,
      hasWarranty,
      warrantyNumber,
      date,
      pen
    } = req.body;

    const updateData = {
      itemType,
      itemName,
      serialNo,
      quantity,
      condition,
      status,
      hasWarranty,
      warrantyNumber,
      date,
      pen
    };

    const updated = await Stock.findOneAndUpdate(
      { stockId: req.params.stockId },
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Stock item not found' });

    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating stock by stockId:', err.message);
    res.status(500).json({ message: 'Update failed' });
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