const express = require('express');
const router = express.Router();
const VehicleFuel = require('../models/Fuel');
const VehicleMovement = require('../models/Movement');
const Accident = require('../models/Accident');
const Purchase = require('../models/Purchase');
const Stock = require('../models/Stock');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

// Utility: ensure toDate includes the full day
function getDateRange(fromDate, toDate) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

// Helper: get user mapping (pen → name (pen))
const getUserMap = async () => {
  const users = await User.find({}, 'pen name');
  const map = {};
  users.forEach((u) => {
    map[u.pen] = `${u.name} (${u.pen})`;
  });
  return map;
};

// PDF Generator
function generateTablePDF(data, res, registerType) {
  const doc = new PDFDocument({ size: 'A4', margin: 30 });
  let buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${registerType}_report.pdf`);
    res.send(pdfData);
  });

  doc.fontSize(18).text(`${registerType.toUpperCase()} REGISTER REPORT`, { align: 'center' });
  doc.moveDown();

  if (data.length === 0) {
    doc.text('No data found.');
    doc.end();
    return;
  }

  const keys = Object.keys(data[0]);

  doc.fontSize(12).fillColor('black');
  keys.forEach((key, i) => {
    doc.text(key.toUpperCase(), { continued: i !== keys.length - 1 });
  });
  doc.moveDown(0.5);
  doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).stroke();

  data.forEach((row) => {
    keys.forEach((key, i) => {
      const text = row[key] !== undefined ? String(row[key]) : '';
      doc.text(text, { continued: i !== keys.length - 1 });
    });
    doc.moveDown(0.5);
  });

  doc.end();
}

// Shared report logic
const fetchReportData = async (type, vehicleOption, vehicleNumber, from, to) => {
  const userMap = await getUserMap();
  let result = [];

  switch (type) {
    case 'fuel': {
      const fuelDocs = vehicleOption === 'all'
        ? await VehicleFuel.find()
        : await VehicleFuel.find({ vehicleNo: vehicleNumber });

      fuelDocs.forEach(doc => {
        doc.fuelEntries.forEach(entry => {
          const entryDate = new Date(entry.date);
          if (entryDate >= from && entryDate <= to) {
            const { pen, _id, createdAt, ...cleaned } = entry.toObject();
            result.push({
              vehicleNo: doc.vehicleNo,
              enteredBy: userMap[pen] || pen,
              ...cleaned
            });
          }
        });
      });
      break;
    }

    case 'movement': {
      const moveDocs = vehicleOption === 'all'
        ? await VehicleMovement.find()
        : await VehicleMovement.find({ vehicleno: vehicleNumber });

      moveDocs.forEach(doc => {
        doc.movements.forEach(entry => {
          const entryDate = new Date(entry.createdAt);
          if (entryDate >= from && entryDate <= to) {
            const { pen, _id, ...cleaned } = entry.toObject();
            result.push({
              vehicleno: doc.vehicleno,
              enteredBy: userMap[pen] || pen,
              ...cleaned
            });
          }
        });
      });
      break;
    }

    case 'accident': {
      const query = vehicleOption === 'all'
        ? { createdAt: { $gte: from, $lte: to } }
        : { vehicleNo: vehicleNumber, createdAt: { $gte: from, $lte: to } };

      const docs = await Accident.find(query).lean();
      result = docs.map(({ _id, createdAt, updatedAt, __v, image, pen, ...rest }) => ({
        ...rest,
        enteredBy: userMap[pen] || pen
      }));
      break;
    }

    case 'purchase': {
  const docs = await Purchase.find({ createdAt: { $gte: from, $lte: to } }).lean();
  result = docs.map(({ _id, billFile, pen, ...rest }) => {
    const enteredBy = userMap[pen] || `Unknown (${pen})`;
    return {
      ...rest,
      enteredBy
    };
  });
  break;
}


    case 'stock': {
      const docs = await Stock.find({ createdAt: { $gte: from, $lte: to } }).lean();
      result = docs.map(({ _id, pen, ...rest }) => ({
        ...rest,
        enteredBy: userMap[pen] || pen
      }));
      break;
    }

    default:
      throw new Error('Invalid register type');
  }

  return result;
};

// JSON endpoint
router.post('/report/:type/json', async (req, res) => {
  const { type } = req.params;
  const { vehicleOption = 'all', vehicleNumber = '', fromDate, toDate } = req.body;

  const { from, to } = getDateRange(fromDate, toDate);

  try {
    const data = await fetchReportData(type, vehicleOption, vehicleNumber, from, to);
    res.json(data);
  } catch (err) {
    console.error('JSON report error:', err);
    res.status(500).json({ error: err.message || 'Error fetching report data' });
  }
});

// PDF endpoint
router.post('/report/:type/pdf', async (req, res) => {
  const { type } = req.params;
  const { vehicleOption = 'all', vehicleNumber = '', fromDate, toDate } = req.body;

  const { from, to } = getDateRange(fromDate, toDate);

  try {
    const data = await fetchReportData(type, vehicleOption, vehicleNumber, from, to);
    generateTablePDF(data, res, type);
  } catch (err) {
    console.error('PDF report error:', err);
    res.status(500).json({ error: err.message || 'Error generating PDF' });
  }
});

module.exports = router;
