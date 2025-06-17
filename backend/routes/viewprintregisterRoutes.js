// backend/routes/report.js

const express = require('express');
const router = express.Router();
const VehicleFuel = require('../models/Fuel');
const VehicleMovement = require('../models/Movement');
const Accident = require('../models/Accident');
const PDFDocument = require('pdfkit');

// Utility: ensure toDate includes full day
function getDateRange(fromDate, toDate) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999); // Include full toDate
  return { from, to };
}

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

  // Header
  doc.fontSize(12).fillColor('black');
  keys.forEach((key, i) => {
    doc.text(key.toUpperCase(), { continued: i !== keys.length - 1 });
  });
  doc.moveDown(0.5);
  doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).stroke();

  // Rows
  data.forEach((row) => {
    keys.forEach((key, i) => {
      const text = row[key] !== undefined ? String(row[key]) : '';
      doc.text(text, { continued: i !== keys.length - 1 });
    });
    doc.moveDown(0.5);
  });

  doc.end();
}


// JSON route for DataGrid view
router.post('/report/:type/json', async (req, res) => {
  const { type } = req.params;
  const { vehicleOption, vehicleNumber, fromDate, toDate } = req.body;
  const { from, to } = getDateRange(fromDate, toDate);
  let result = [];

  try {
    switch (type) {
      case 'fuel': {
        const fuelDocs = vehicleOption === 'all'
          ? await VehicleFuel.find()
          : await VehicleFuel.find({ vehicleNo: vehicleNumber });

        fuelDocs.forEach(doc => {
          doc.fuelEntries.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate >= from && entryDate <= to) {
              const entryObj = entry.toObject();
              delete entryObj._id;
              delete entryObj.createdAt;

              result.push({ vehicleNo: doc.vehicleNo, ...entryObj });
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
              const entryObj = entry.toObject();
              delete entryObj._id;

              result.push({ vehicleno: doc.vehicleno, ...entryObj });
            }
          });
        });
        break;
      }

      case 'accident': {
        const query = vehicleOption === 'all'
          ? { createdAt: { $gte: from, $lte: to } }
          : { vehicleNo: vehicleNumber, createdAt: { $gte: from, $lte: to } };

        const accidentDocs = await Accident.find(query).lean();
        result = accidentDocs.map((doc) => {
          const {
            _id, createdAt, updatedAt, __v, image, ...cleaned
          } = doc;
          return cleaned;
        });
        break;
      }

      default:
        return res.status(400).json({ error: 'Invalid register type' });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching data' });
  }
});


// PDF download route
router.post('/report/:type/pdf', async (req, res) => {
  const { type } = req.params;
  const { vehicleOption, vehicleNumber, fromDate, toDate } = req.body;
  const { from, to } = getDateRange(fromDate, toDate);
  let result = [];

  try {
    switch (type) {
      case 'fuel': {
        const fuelDocs = vehicleOption === 'all'
          ? await VehicleFuel.find()
          : await VehicleFuel.find({ vehicleNo: vehicleNumber });

        fuelDocs.forEach(doc => {
          doc.fuelEntries.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate >= from && entryDate <= to) {
              const entryObj = entry.toObject();
              delete entryObj._id;
              delete entryObj.createdAt;

              result.push({ vehicleNo: doc.vehicleNo, ...entryObj });
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
              const entryObj = entry.toObject();
              delete entryObj._id;

              result.push({ vehicleno: doc.vehicleno, ...entryObj });
            }
          });
        });
        break;
      }

      case 'accident': {
        const query = vehicleOption === 'all'
          ? { createdAt: { $gte: from, $lte: to } }
          : { vehicleNo: vehicleNumber, createdAt: { $gte: from, $lte: to } };

        const accidentDocs = await Accident.find(query).lean();
        result = accidentDocs.map((doc) => {
          const {
            _id, createdAt, updatedAt, __v, image, ...cleaned
          } = doc;
          return cleaned;
        });
        break;
      }

      default:
        return res.status(400).json({ error: 'Invalid register type' });
    }

    generateTablePDF(result, res, type);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating PDF' });
  }
});

module.exports = router;
