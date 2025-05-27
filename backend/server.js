const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Admin = require('./models/Admin'); // Add Admin model if you are using roles
const MovementRegister = require('./models/MovementRegister');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve static files

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only .jpg, .jpeg, .png files are allowed'));
    }
    cb(null, true);
  }
});

// MongoDB connection
mongoose.connect('mongodb+srv://kepamotor:arya1234@cluster0.n6bhdzu.mongodb.net/kepa')
  .then(() => console.log('✅ MongoDB connected to kepa DB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Register Route
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

// Login Route
app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  const collection = role === 'user' ? User : Admin;

  try {
    const user = await collection.findOne({ email });

    if (!user) return res.status(401).json({ message: 'Invalid email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    res.status(200).json({
      message: 'Login successful',
      role,
      pen: user.pen,
      generalNo: user.generalNo,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      licenseNo: user.licenseNo,
      bloodGroup: user.bloodGroup,
      gender: user.gender,
      photo: user.photo ? `http://localhost:5000/uploads/${user.photo}` : null,
      signature: user.signature ? `http://localhost:5000/uploads/${user.signature}` : null
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get User by Email
app.get('/api/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      ...user,
      photo: user.photo ? `http://localhost:5000/uploads/${user.photo}` : '',
      signature: user.signature ? `http://localhost:5000/uploads/${user.signature}` : ''
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user data', error: err.message });
  }
});

// Movement Register API
app.post('/api/movement', async (req, res) => {
  try {
    const {
      vehicleno, startingkm, startingtime,
      destination, purpose, officerincharge = '',
      closingkm = '', closingtime = ''
    } = req.body;

    const newEntry = new MovementRegister({
      vehicleno, startingkm, startingtime,
      destination, purpose, officerincharge,
      closingkm, closingtime
    });

    await newEntry.save();
    res.status(201).json({ message: 'Movement data saved successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving movement data', error: err.message });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 സെർവർ ഓടുകയാണ്.....Server running on port ${PORT}`);
});

