const express = require('express');
const router = express.Router();
const multer = require('multer');
const Purchase = require('../models/Purchase');

// Use memory storage for multer (stores file in RAM)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 POST /api/purchases — Add a new purchase
router.post('/', upload.single('billFile'), async (req, res) => {
  try {
    const { itemName, quantity, price, vendor, billNo } = req.body;

    const billFile = req.file
      ? {
          data: req.file.buffer,
          contentType: req.file.mimetype
        }
      : undefined;

    const purchase = new Purchase({
      itemName,
      quantity,
      price,
      vendor,
      billNo,
      billFile
    });

    await purchase.save();
    res.status(201).json(purchase);
  } catch (err) {
    console.error('Error saving purchase:', err);
    res.status(500).json({ message: 'Failed to add purchase' });
  }
});

// 📌 GET /api/purchases — Fetch all purchases (with base64-encoded bill)
router.get('/', async (req, res) => {
  try {
    const purchases = await Purchase.find();

    const formatted = purchases.map(p => ({
      ...p._doc,
      billFile: p.billFile?.data
        ? {
            data: p.billFile.data.toString('base64'),
            contentType: p.billFile.contentType
          }
        : null
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching purchases:', err);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
});

// 📌 GET /api/purchases/:id/bill — Get raw bill file by ID (optional)
router.get('/:id/bill', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase || !purchase.billFile || !purchase.billFile.data) {
      return res.status(404).json({ message: 'Bill file not found' });
    }

    res.set('Content-Type', purchase.billFile.contentType);
    res.send(purchase.billFile.data);
  } catch (err) {
    console.error('Error retrieving bill file:', err);
    res.status(500).json({ message: 'Failed to retrieve bill file' });
  }
});

module.exports = router;
