const express = require('express');
const router = express.Router();
const multer = require('multer');
const Purchase = require('../models/Purchase');
const User = require('../models/User');

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * 📥 GET /api/purchases — Fetch all purchases with enteredBy name
 */
router.get('/', async (req, res) => {
  try {
    const purchases = await Purchase.find().lean();
    const users = await User.find({}, { pen: 1, name: 1 }).lean();

    const userMap = {};
    users.forEach(u => {
      userMap[u.pen] = u.name;
    });

    const enriched = purchases.map(p => {
      const { __v, createdAt, updatedAt, ...cleaned } = p;
      return {
        ...cleaned,
        enteredBy: userMap[p.pen] ? `${userMap[p.pen]} (${p.pen})` : p.pen
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error while fetching purchases');
  }
});

/**
 * ➕ POST /api/purchases — Add a new purchase
 */
router.post('/', upload.single('billFile'), async (req, res) => {
  try {
    const { itemName, quantity, price, date, Firm, billNo, pen, warrantyNumber } = req.body;

    const billFile = req.file
      ? { data: req.file.buffer, contentType: req.file.mimetype }
      : undefined;
    
    const purchaseId = 'PUR-' + Date.now();  
      
    const purchase = new Purchase({
      purchaseId,
      itemName,
      quantity,
      price,
      Firm,
      date,
      billNo,
      pen,
      warrantyNumber: warrantyNumber || '',
      billFile
    });

    await purchase.save();
    res.status(201).json(purchase);
  } catch (err) {
    console.error('Error saving purchase:', err);
    res.status(500).json({ message: 'Failed to add purchase' });
  }
});

/**
 * ✏️ PUT /api/purchases/:id — Update a purchase
 */
router.put('/byPurchaseId/:purchaseId', upload.single('billFile'), async (req, res) => {
  try {
    const { itemName, quantity, price, Firm, date, billNo, pen, warrantyNumber } = req.body;

    const updateData = {
      itemName,
      quantity: Number(quantity),
      price: Number(price),
      Firm,
      date,
      billNo,
      pen,
      warrantyNumber: warrantyNumber || ''
    };

    if (req.file) {
      updateData.billFile = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const updated = await Purchase.findOneAndUpdate({ purchaseId: req.params.purchaseId }, updateData, { new: true });

    if (!updated) return res.status(404).json({ message: 'Purchase not found' });

    res.json(updated);
  } catch (err) {
    console.error('Error updating purchase by purchaseId:', err);
    res.status(500).json({ message: 'Update failed' });
  }
});


/**
 * 📄 GET /api/purchases/:id/bill — View bill file
 */
router.get('/:id/bill', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase || !purchase.billFile || !purchase.billFile.data) {
      return res.status(404).send('Bill not found');
    }

    res.contentType(purchase.billFile.contentType);
    res.send(purchase.billFile.data);
  } catch (err) {
    console.error('Error retrieving bill file:', err);
    res.status(500).json({ message: 'Failed to retrieve bill file' });
  }
});

/**
 * ❌ DELETE /api/purchases/:id — Delete a purchase
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Purchase.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Purchase not found' });

    res.json({ message: 'Purchase deleted successfully' });
  } catch (err) {
    console.error('Error deleting purchase:', err);
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;
