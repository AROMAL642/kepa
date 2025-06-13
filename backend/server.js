require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Routes
const repairRequestRoutes = require('./routes/repairRequestRoutes');
const repairAdminRoutes = require('./routes/repairAdminRoutes');
const userRoutes = require('./routes/Edituser');
const movementRoutes = require('./routes/movementRoutes');
const addRemoveVehicleRoutes = require('./routes/addremovevehicleRoutes');
const searchVehicleRoute = require('./routes/searchVehicle');
const assignVehicleRoutes = require('./routes/assignVehicleRoutes');
const fuelRoutes = require('./routes/fuelregisterRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const userDetailsRoutes = require('./routes/userDetailsRoutes');
const accidentRoutes = require('./routes/accidentreportRoutes');
const eyeTestRoutes = require('./routes/eyeTestRoutes');

// Models
const User = require('./models/User');
const MovementRegister = require('./models/Movement');
const Vehicle = require('./models/Vehicle');


// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Optional static folder for profile/signature uploads (if used elsewhere)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected to kepa DB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes usage
app.use('/api/repair-request', repairRequestRoutes);
app.use('/api/admin-repair', repairAdminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movement', movementRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/vehicles', addRemoveVehicleRoutes);
app.use('/searchvehicle', searchVehicleRoute);
app.use('/api/assignvehicle', assignVehicleRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/vehicles', vehicleRoutes); // duplicate path, ensure they're logically separate
app.use('/api/user-details', userDetailsRoutes);
app.use('/api/accidents', accidentRoutes);
app.use('/api/eyetests', eyeTestRoutes);

// Registration
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
      verified: 'NO'
    });

    await newUser.save();
    res.status(201).json({ message: 'Registration Request Sent Successfully. Wait for Approval.' });
  } catch (err) {
    console.error('❌ Error saving user:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { pen, password } = req.body;

  try {
    const user = await User.findOne({ pen });
    if (!user) return res.status(401).json({ message: 'Invalid PEN number' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    if (user.role !== 'admin' && user.verified !== 'YES') {
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

    if (user.role === 'user' || user.role === 'fuel') {
      return res.status(200).json({
        ...baseResponse,
        generalNo: user.generalNo,
        phone: user.phone,
        dob: user.dob,
        licenseNo: user.licenseNo,
        bloodGroup: user.bloodGroup,
        gender: user.gender
      });
    } else {
      return res.status(200).json(baseResponse);
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

// Get MTI Admin
app.get('/api/mtiadmin/:email', async (req, res) => {
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

// View Unverified Users
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

// Verify User by Email
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

// Get Specific User
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
