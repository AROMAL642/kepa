const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');

// POST /api/stocks - Add a new stock item
router.post('/', async (req, res) => {
  try {
    const {
      itemType,
      itemName,
      quantity,
      condition,
      status,
      serialNo,
      hasWarranty,
      warrantyNumber
    } = req.body;

    const stock = new Stock({
      itemType,
      itemName,
      quantity,
      condition,
      status,
      serialNo,
      hasWarranty,
      warrantyNumber: hasWarranty ? warrantyNumber : ''
    });

    await stock.save();
    res.status(201).json({ message: 'Stock item added successfully', stock });
  } catch (err) {
    console.error('Error saving stock:', err);
    res.status(500).json({ message: 'Failed to add stock item' });
  }
});

// GET /api/stocks - Get all stock items
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stock items' });
  }
});

module.exports = router;
