const express = require('express');
const router = express.Router();
const VehicleFuel = require('../models/Fuel');

// POST /api/fuel/expense-summary
router.post('/expense-summary', async (req, res) => {
  const { vehicleNo, fromDate, toDate } = req.body;

  try {
    const vehicle = await VehicleFuel.findOne({ vehicleNo });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Filter entries within the date range
    const filteredEntries = vehicle.fuelEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate >= new Date(fromDate) &&
        entryDate <= new Date(toDate) &&
        entry.status === 'approved'
      );
    });

    // Calculate total amount
    const totalAmount = filteredEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);

    res.json({ totalAmount, count: filteredEntries.length });
  } catch (error) {
    console.error('Error calculating fuel expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
