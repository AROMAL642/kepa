require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express(); 

// Models
const User = require('./models/User');
const Admin = require('./models/Admin');
const MovementRegister = require('./models/MovementRegister');
const Vehicle = require('./models/Vehicle');
const RepairRequest = require('./models/RepairRequest');  // Adjust path as needed

// Routes
const repairRequestRoutes = require('./routes/repairRequestRoutes'); // adjust path if needed
const repairAdminRoute = require('./routes/repairAdminRoute'); // adjust path if needed

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected to kepa DB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Multer Setup for file uploads (bill files)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Save file with unique timestamp + original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Use imported routes
app.use('/api/user', repairRequestRoutes);
app.use('/api/admin', repairAdminRoute);

// === User Registration ===
app.post('/register', async (req, res) => {
  const {
    pen, generalNo, name, email, phone, licenseNo,
    dob, gender, bloodGroup, password, photo, signature
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'User already exists' });

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

// === Login for User & Admin ===
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

// === Get User by Email ===
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

// === Get Admin by Email ===
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

// === Movement Register Entry ===
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

// === Add Vehicle ===
app.post('/api/vehicles', async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    await newVehicle.save();
    res.status(201).json({ message: 'Vehicle added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving vehicle', error: err.message });
  }
});

// === Fetch all unverified users ===
app.get('/api/unverified-users', async (req, res) => {
  try {
    const unverifiedUsers = await User.find(
      { verified: 'NO' },
      { email: 1, name: 1, pen: 1, generalNo: 1 }
    );
    res.status(200).json(unverifiedUsers);
  } catch (err) {
    console.error('Error fetching unverified users:', err);
    res.status(500).json({ message: 'Error fetching unverified users', error: err.message });
  }
});

// === Verify a user by email ===
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

// === View user details by id ===
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// === Submit a new repair request with bill upload ===
app.post('/api/repair-request', upload.single('bill'), async (req, res) => {
  try {
    const {
      userName,
      penNumber,
      vehicleNumber,
      subject,
      description
    } = req.body;

    // Optional: Check if request already exists with same vehicleNumber or other unique field

    const newRequest = new RepairRequest({
      userName,
      penNumber,
      vehicleNumber,
      subject,
      description,
      bill: req.file ? req.file.filename : null,
      status: 'pending',
      createdAt: new Date(),
      verificationAttempts: []
    });

    await newRequest.save();
    res.status(201).json({ message: 'Repair request submitted successfully', data: newRequest });
  } catch (err) {
    console.error('❌ Failed to submit repair request:', err);
    res.status(500).json({ message: 'Failed to submit repair request', error: err.message });
  }
});

// === Verify repair request ===
app.post('/api/repair-request/verify', async (req, res) => {
  try {
    const { appNo, verified, issue } = req.body;

    const request = await RepairRequest.findOne({ appNo });
    if (!request) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    // Push verification attempt to history
    request.verificationAttempts.push({
      verified,
      issueDescription: verified === false ? issue : '',
      date: new Date()
    });

    // Update current verification status and issue description
    request.verified = verified;
    request.issueDescription = verified === false ? issue : '';

    await request.save();

    res.json({ message: 'Verification status updated', data: request });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update verification status', error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

