const express = require('express');
const router = express.Router();
const RepairRequest = require('../models/RepairRequestAdmin');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// ✅ Get all repair requests for admin viewing (includes uploaded bill + subject)
router.get('/repair-requests', async (req, res) => {
  try {
    const requests = await RepairRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch repair requests' });
  }
});

// ✅ Existing: Get only pending repair requests
router.get('/pending', async (req, res) => {
  try {
    const requests = await RepairRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending repair requests' });
  }
});

// ✅ Existing: Generate a PDF version of a single request
router.get('/pdf/:id', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=RepairRequest_${request._id}.pdf`,
        'Content-Length': pdfData.length,
      }).end(pdfData);
    });

    doc.fontSize(18).text('Repair Request Form', { align: 'center' });
    doc.moveDown(2);

    const labelX = 50, valueX = 180, lineGap = 20;
    let y = doc.y;

    doc.fontSize(12).text('User Name:', labelX, y).text(request.userName, valueX, y);
    y += lineGap;
    doc.text('PEN Number:', labelX, y).text(request.penNumber, valueX, y);
    y += lineGap;
    doc.text('Vehicle No:', labelX, y).text(request.vehicleNumber || '-', valueX, y);
    y += lineGap;
    doc.text('Subject:', labelX, y).text(request.subject || '-', valueX, y);
    y += lineGap * 2;
    doc.fontSize(14).text('Description:', labelX, y, { underline: true });
    y += 25;
    doc.fontSize(12).text(request.description || '-', { align: 'left', indent: 20, width: 400 });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// ✅ Optional: Serve uploaded bill files
router.get('/bill/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Bill not found' });
  }
});

module.exports = router;
