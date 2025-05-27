const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const app = express(); 

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect('mongodb+srv://kepamotor:arya1234@cluster0.n6bhdzu.mongodb.net/kepa')
  .then(() => console.log('✅ MongoDB connected to kepa DB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Models
const User = require('./models/User');
const Admin = require('./models/Admin');
const MovementRegister = require('./models/MovementRegister');

// Register User
app.post('/register', async (req, res) => {
  const {
    pen, generalNo, name, email, phone, licenseNo,
    dob, gender, bloodGroup, password, photo, signature
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      pen, generalNo, name, email, phone, licenseNo,
      dob, gender, bloodGroup, password: hashedPassword,
      photo, signature
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('❌ Error saving user:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Login Route for both User and Admin
app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  const collection = role === 'user' ? User : Admin;

  try {
    const user = await collection.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email' });
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const baseResponse = {
      message: 'Login successful',
      role,
      name: user.name,
      email: user.email,
      pen: user.pen,
      photo: user.photo || '',
      signature: user.signature || ''
    };

    if (role === 'user') {
      res.status(200).json({
        ...baseResponse,
        generalNo: user.generalNo,
        phone: user.phone,
        dob: user.dob,
        licenseNo: user.licenseNo,
        bloodGroup: user.bloodGroup,
        gender: user.gender
      });
    } else {
      res.status(200).json(baseResponse);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user by email
app.get('/api/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      ...user,
      photo: user.photo?.toString('base64') || '',
      signature: user.signature?.toString('base64') || ''
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user data', error: err.message });
  }
});

//Get admin by email (similar to user profile fetch)
app.get('/api/admin/:email', async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.params.email }).lean();
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    res.json({
      ...admin,
      photo: admin.photo?.toString('base64') || '',
      signature: admin.signature?.toString('base64') || ''
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admin data', error: err.message });
  }
});

// Movement Register
app.post('/api/movement', async (req, res) => {
  try {
    const {
      vehicleno,
      startingkm,
      startingtime,
      destination,
      purpose,
      officerincharge = '',
      closingkm = '',
      closingtime = ''
    } = req.body;

    const newEntry = new MovementRegister({
      vehicleno,
      startingkm,
      startingtime,
      destination,
      purpose,
      officerincharge,
      closingkm,
      closingtime
    });

    await newEntry.save();
    res.status(201).json({ message: 'Movement data saved successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving movement data', error: err.message });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 സെർവർ ഓടുകയാണ്.....Server running on port ${PORT}`);
});
