require('dotenv').config();

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
mongoose.connect(process.env.MONGO_URI)
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
const Vehicle = require('./models/Vehicle');

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
      photo, signature,
      verified: 'NO' // default
    });

    await newUser.save();
    res.status(201).json({ message: 'Registration Request Sent Successfully. Wait for Approval.' });
  } catch (err) {
    console.error('❌ Error saving user:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Login Route for both User and Admin


app.post('/login', async (req, res) => {
  const { pen, password } = req.body;

  try {
    // Check if user or admin exists with this pen
    const user = await User.findOne({ pen });
    if (!user) return res.status(401).json({ message: 'Invalid PEN number' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    if (user.role === 'user' && user.verified !== 'YES') {
      return res.status(403).json({ message: 'User not verified. Please wait for approval.' });
    }

    const baseResponse = {
      message: 'Login successful',
      role: user.role,
      name: user.name,
      email: user.email,
      pen: user.pen,
      photo: user.photo || '',
      signature: user.signature || ''
    };

    if (user.role === 'user') {
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



// Get User by Email
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

// Get Admin by Email
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

// Add Vehicle
app.post('/api/vehicles', async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    await newVehicle.save();
    res.status(201).json({ message: 'Vehicle added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving vehicle', error: err.message });
  }
});


// Fetch all unverified users with role = 'user'
app.get('/api/unverified-users', async (req, res) => {
  try {
    const unverifiedUsers = await User.find(
      { verified: 'NO', role: 'user' },
      { email: 1, name: 1, pen: 1, generalNo: 1 }
    );
    res.status(200).json(unverifiedUsers);
  } catch (err) {
    console.error('Error fetching unverified users:', err);
    res.status(500).json({ message: 'Error fetching unverified users', error: err.message });
  }
});

// Verify a user by email
app.put('/api/verify-user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOneAndUpdate({ email }, { verified: 'YES' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User verified successfully', user });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});

// View specific user details
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});



// Fetch all verified users with role = 'user'
app.get('/api/verified-users', async (req, res) => {
  try {
    const verifiedUsers = await User.find(
      { verified: 'YES', role: 'user' },
      { name: 1, pen: 1, generalNo: 1, phone: 1, email: 1 } // projection
    );
    res.status(200).json(verifiedUsers);
  } catch (err) {
    console.error('Error fetching verified users:', err);
    res.status(500).json({ message: 'Error fetching verified users', error: err.message });
  }
});




// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
