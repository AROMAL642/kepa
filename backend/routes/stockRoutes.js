// backend/routes/stocks.js
const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');

// Get all stock entries
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (err) {
    console.error('Error fetching stocks:', err.message);
    res.status(500).send('Server Error');
  }
});

// Add new stock
router.post('/', async (req, res) => {
  try {
    console.log('Incoming stock data:', req.body); // ✅ Log the data
    const newStock = new Stock(req.body);
    const savedStock = await newStock.save();
    res.status(201).json(savedStock);
  } catch (err) {
   console.error('❌ Error saving stock item:', err.message);
   console.error('🛑 Stack Trace:', err.stack);
 // ✅ Log the actual error
    res.status(400).json({ message: 'Failed to add stock item', error: err.message });
  }
});


// Update stock by ID
// Update stock by ID
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

// Delete stock by ID
// backend/routes/stockRoutes.js
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
