const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const User = require('../models/User');

router.put('/update', async (req, res) => {
  const { pen, name, dob, email, mobile, licenseNo, photo } = req.body;

  if (!pen) return res.status(400).json({ message: 'PEN is required for update' });

  try {
    const updatedUser = await User.findOneAndUpdate(
      { pen },
      {
        $set: {
          name,
          dob,
          email,
          phone: mobile,
          licenseNo,
          photo
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ updatedUser });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});



router.put('/update-admin', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]), async (req, res) => {
  const { pen } = req.body;

  if (!pen) return res.status(400).json({ error: 'PEN is required' });

  const allowedFields = ['name', 'email', 'phone', 'licenseNo', 'dob'];
  const updates = {};

  // Update editable fields
  allowedFields.forEach(field => {
    if (req.body[field]) {
      updates[field] = req.body[field];
    }
  });

  // Convert uploaded files to base64
if (req.files?.photo?.[0]) {
  const mimeType = req.files.photo[0].mimetype;
  const base64 = req.files.photo[0].buffer.toString('base64');
  updates.photo = `data:${mimeType};base64,${base64}`;
} else if (req.body.photo) {
  updates.photo = req.body.photo; // <-- ADD THIS
}

if (req.files?.signature?.[0]) {
  const mimeType = req.files.signature[0].mimetype;
  const base64 = req.files.signature[0].buffer.toString('base64');
  updates.signature = `data:${mimeType};base64,${base64}`;
} else if (req.body.signature) {
  updates.signature = req.body.signature; // <-- ADD THIS
}



  try {
    const updatedUser = await User.findOneAndUpdate(
      { pen },
      { $set: updates },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
