// routes/eyeTestRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const EyeTestReport = require('../models/eyetestreport');

// Use memory storage to keep files in memory instead of writing to disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('reportFile'), async (req, res) => {
  try {
    const { pen, date } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'File not found' });
    }

    const base64Data = file.buffer.toString('base64');

    const newReport = {
      date,
      fileData: base64Data,
      fileType: file.mimetype,
    };

    // Check if a report already exists for this pen
    let eyeTestDoc = await EyeTestReport.findOne({ pen });

    if (eyeTestDoc) {
      eyeTestDoc.reports.unshift(newReport); // add newest report at the start
      await eyeTestDoc.save();
    } else {
      eyeTestDoc = new EyeTestReport({
        pen,
        reports: [newReport],
      });
      await eyeTestDoc.save();
    }

    res.status(201).json({ message: 'Report uploaded successfully', newReport });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload report', error: error.message });
  }
});

//get latest report by pen

// GET latest report for a specific PEN
router.get('/:pen', async (req, res) => {
  try {
    const { pen } = req.params;
    const doc = await EyeTestReport.findOne({ pen });

    if (!doc || doc.reports.length === 0) {
      return res.status(404).json({ message: 'No reports found for this PEN' });
    }

    const latestReport = doc.reports[0]; // Most recent is at start
    res.json({ latestReport });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching report', error: error.message });
  }
});


router.get('/view/:pen', async (req, res) => {
  try {
    const { pen } = req.params;
    const reportDoc = await EyeTestReport.findOne({ pen });

    if (!reportDoc || reportDoc.reports.length === 0) {
      return res.status(404).send('No report found');
    }

    const latestReport = reportDoc.reports[0];

    const fileBuffer = Buffer.from(latestReport.fileData, 'base64');

    res.setHeader('Content-Type', latestReport.fileType);
    res.setHeader('Content-Disposition', 'inline'); // or 'attachment' to force download
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).send('Error serving report');
  }
});


//view eyetest report by admin
router.get('/details/:pen', async (req, res) => {
  try {
    const { pen } = req.params;
    const reportDoc = await EyeTestReport.findOne({ pen });

    if (!reportDoc || reportDoc.reports.length === 0) {
      return res.status(404).json({ message: 'No Eye Test Report found for this PEN' });
    }

    const latestReport = reportDoc.reports[0];

    res.status(200).json({
      pen,
      date: latestReport.date,
      fileType: latestReport.fileType,
      // Uncomment the next line if you want to send base64 too
      // fileData: latestReport.fileData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving Eye Test details', error: error.message });
  }
});



module.exports = router;
