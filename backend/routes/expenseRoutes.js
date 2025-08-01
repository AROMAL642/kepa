const express = require('express');
const router = express.Router();
const VehicleFuel = require('../models/Fuel');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const RepairRequest = require('../models/RepairRequests'); // Import RepairRequest model

router.post('/expense-summary', async (req, res) => {
  const { vehicleNo, fromDate, toDate, category } = req.body;

  try {
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    // --------- ALL EXPENSE SUMMARY ---------
    if (category === 'all') {
      const responseList = [];

      // FUEL
      const fuelVehicle = await VehicleFuel.findOne({ vehicleNo });
      let fuelAmount = 0;
      if (fuelVehicle) {
        const filteredEntries = fuelVehicle.fuelEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= from && entryDate <= to && entry.status === 'approved';
        });
        fuelAmount = filteredEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
        if (fuelAmount > 0) {
          responseList.push({
            vehicleNo,
            category: 'fuel',
            totalExpense: fuelAmount
          });
        }
      }

      // REPAIR
      const repairEntries = await RepairRequest.find({
        vehicleNo,
        date: { $gte: fromDate, $lte: toDate },
        status: 'completed'
      });
      let repairAmount = 0;
      if (repairEntries && repairEntries.length > 0) {
        repairAmount = repairEntries.reduce(
          (sum, e) => sum + (e.expense || 0) + (e.workerWage || 0),
          0
        );
        if (repairAmount > 0) {
          responseList.push({
            vehicleNo,
            category: 'repair',
            totalExpense: repairAmount
          });
        }
      }

      // INSURANCE & POLLUTION
      const vehicle = await Vehicle.findOne({ number: vehicleNo });
      if (vehicle) {
        const insuranceCerts = vehicle.certificateHistory.filter(cert => {
          const issued = new Date(cert.insuranceIssuedDate);
          return issued >= from && issued <= to;
        });

        const insuranceTotal = insuranceCerts.reduce(
          (sum, cert) => sum + (cert.insuranceExpense || 0),
          0
        );
        if (insuranceTotal > 0) {
          responseList.push({
            vehicleNo,
            category: 'insurance',
            totalExpense: insuranceTotal
          });
        }

        const pollutionCerts = vehicle.certificateHistory.filter(cert => {
          const issued = new Date(cert.pollutionIssuedDate);
          return issued >= from && issued <= to;
        });

        const pollutionTotal = pollutionCerts.reduce(
          (sum, cert) => sum + (cert.pollutionExpense || 0),
          0
        );
        if (pollutionTotal > 0) {
          responseList.push({
            vehicleNo,
            category: 'pollution',
            totalExpense: pollutionTotal
          });
        }
      }

      const totalAmount = responseList.reduce((sum, e) => sum + e.totalExpense, 0);
      return res.json({ totalAmount, entries: responseList });
    }

    // -------- FUEL EXPENSE --------
    if (category === 'fuel') {
      const vehicle = await VehicleFuel.findOne({ vehicleNo });
      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

      const filteredEntries = vehicle.fuelEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return (
          entryDate >= from &&
          entryDate <= to &&
          entry.status === 'approved'
        );
      });

      const penArray = [...new Set(filteredEntries.map(e => e.pen.trim()))];
      const users = await User.find({ pen: { $in: penArray } }, 'pen name');
      const userMap = Object.fromEntries(users.map(user => [user.pen.trim(), user.name]));

      const entries = filteredEntries.map(entry => ({
        pen: entry.pen,
        name: userMap[entry.pen.trim()] || 'Unknown',
        amount: entry.amount,
        date: entry.date
      }));

      const totalAmount = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
      return res.json({ totalAmount, count: entries.length, entries });
    }

    // -------- INSURANCE & POLLUTION EXPENSE --------
    if (['insurance', 'pollution'].includes(category)) {
      const vehicle = await Vehicle.findOne({ number: vehicleNo });
      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

      const certs = vehicle.certificateHistory.filter(cert => {
        const certDate =
          category === 'insurance'
            ? new Date(cert.insuranceIssuedDate)
            : new Date(cert.pollutionIssuedDate);
        return certDate >= from && certDate <= to;
      });

      const entries = certs.map(cert => {
        return {
          amount:
            category === 'insurance'
              ? cert.insuranceExpense
              : cert.pollutionExpense,
          date:
            category === 'insurance'
              ? cert.insuranceIssuedDate
              : cert.pollutionIssuedDate,
          policyNo:
            category === 'insurance'
              ? cert.insurancePolicyNo
              : cert.pollutionCertificateNo,
          validity:
            category === 'insurance'
              ? cert.insuranceValidity
              : cert.pollutionValidity,
          pen: '-',
          name: category.charAt(0).toUpperCase() + category.slice(1)
        };
      });

      const totalAmount = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
      return res.json({ totalAmount, count: entries.length, entries });
    }

    // -------- REPAIR EXPENSE --------
    if (category === 'repair') {
      const repairEntries = await RepairRequest.find({
        vehicleNo,
        date: { $gte: fromDate, $lte: toDate },
        status: 'completed'
      });

      const entries = repairEntries.map(entry => ({
        vehicleNo: entry.vehicleNo,
        date: entry.date,
        expense: entry.expense || 0,
        workerWage: entry.workerWage || 0,
        totalExpense: (entry.expense || 0) + (entry.workerWage || 0)
      }));

      const totalAmount = entries.reduce((sum, e) => sum + e.totalExpense, 0);
      return res.json({ totalAmount, count: entries.length, entries });
    }

    return res.status(400).json({ error: 'Invalid category' });
  } catch (err) {
    console.error('Error calculating expense:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
