const express = require('express');
const router = express.Router();
const multer = require('multer');
const License = require('../models/License');

// Use memory storage to store file in RAM before saving to DB
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { pen, licenseNo, validityDate } = req.body;
    const file = req.file;

    const newLicense = new License({
      pen,
      licenseNo,
      validityDate,
      file: {
        data: file.buffer,
        contentType: file.mimetype,
        originalName: file.originalname
      }
    });

    await newLicense.save();
    res.status(200).json({ message: "License saved successfully", id: newLicense._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving license" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const license = await License.findById(req.params.id);
    if (!license || !license.file || !license.file.data) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.set('Content-Type', license.file.contentType);
    res.send(license.file.data);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving file' });
  }
});

router.get('/latest/:pen', async (req, res) => {
  const { pen } = req.params;
  const latest = await License.findOne({ pen }).sort({ createdAt: -1 });
  if (!latest) return res.status(404).json({ message: 'No license found' });
  res.json({ latestLicense: latest });
});

router.get('/view/:pen', async (req, res) => {
  try {
    const license = await License.findOne({ pen: req.params.pen }).sort({ createdAt: -1 });

    if (!license || !license.file || !license.file.data) {
      return res.status(404).send('License file not found');
    }

    res.setHeader('Content-Type', license.file.contentType);
    res.setHeader('Content-Disposition', 'inline');
    res.send(license.file.data);
  } catch (err) {
    console.error('Error serving license:', err);
    res.status(500).send('Error retrieving license');
  }
});

module.exports = router;
