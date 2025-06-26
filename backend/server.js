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
app.use(express.json({ limit: '10mb' }));
const UPLOADS_DIR = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOADS_DIR));


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
// const upload = multer({ storage });

// Use imported routes
// Models
const User = require('./models/User');

const MovementRegister = require('./models/Movement');
const Vehicle = require('./models/Vehicle');

// User Registration 
app.post('/register', async (req, res) => {
  const {
    pen, generalNo, name, email, phone, licenseNo,
    dob, gender, bloodGroup, password, photo, signature
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Only include generalNo if it’s not an empty string
    const userData = {
      pen,
      name,
      email,
      phone,
      licenseNo,
      dob,
      gender,
      bloodGroup,
      password: hashedPassword,
      photo,
      signature,
      verified: 'NO',
    };

    if (generalNo && generalNo.trim() !== '') {
      userData.generalNo = generalNo.trim();
    }

    const newUser = new User(userData);

    await newUser.save();
    res.status(201).json({ message: 'Registration Request Sent Successfully. Wait for Approval.' });
  } catch (err) {
    console.error('❌ Error saving user:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Login Route for User, Admin, and Fuel Section

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

    if (user.role === 'user') {
      return res.status(200).json({
        ...baseResponse,
        generalNo: user.generalNo,
        phone: user.phone,
        dob: user.dob,
        licenseNo: user.licenseNo,
        bloodGroup: user.bloodGroup,
        gender: user.gender
      });
    } else if (user.role === 'fuel') {
      return res.status(200).json({
        ...baseResponse,
        phone: user.phone,
        dob: user.dob,
        licenseNo: user.licenseNo,
        bloodGroup: user.bloodGroup,
        gender: user.gender
      });
    } else {
      return res.status(200).json({
        ...baseResponse,
        generalNo: user.generalNo || '',
        phone: user.phone || '',
        dob: user.dob || '',
        licenseNo: user.licenseNo || '',
        bloodGroup: user.bloodGroup || '',
        gender: user.gender || '',
        role: user.role || ''
      });

    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//  Get User by Email 
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


//edit user profile
const userRoutes = require('./routes/Edituser');
app.use('/api/users', userRoutes); 

app.use('/api', userRoutes);


// Register by Admin Route
const registerByAdminRoute = require('./routes/registerbyadmin');
app.use('/registerbyadmin', registerByAdminRoute);

//reset password
const resetPasswordRoute = require('./routes/resetPasswordRoute');
app.use('/api', resetPasswordRoute);

//  Movement Register Entry 

const movementRoutes = require('./routes/movementRoutes');
app.use('/api/movement', movementRoutes);

app.use('/api/movements', movementRoutes);

// Add or remove Vehicle

const addRemoveVehicleRoutes = require('./routes/addremovevehicleRoutes');
app.use('/api/vehicles', addRemoveVehicleRoutes);

//search vehcle

const searchVehicleRoute = require('./routes/searchVehicle');
app.use('/', searchVehicleRoute);
app.use('/api/vehicle', searchVehicleRoute);


//assign vehicle
const assignVehicleRoutes = require('./routes/assignVehicleRoutes');
app.use('/api/assignvehicle', assignVehicleRoutes);

//fuel register by user


const fuelRoutes = require('./routes/fuelregisterRoutes'); 
app.use('/api/fuel', fuelRoutes); 
app.use('/api', fuelRoutes);




// vehicle number validation
const vehicleRoutes = require('./routes/vehicleRoutes');
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vehicle', vehicleRoutes);
//fetch all verified users

const userDetailsRoutes = require('./routes/userDetailsRoutes');
app.use('/api/user-details', userDetailsRoutes);


//delete user by admin

app.use('/api/user-delete', userDetailsRoutes);

//Accident Report
const accidentRoutes = require('./routes/accidentreportRoutes');
app.use('/api/accidents', accidentRoutes);
app.use('/api', accidentRoutes);
//eye test report
const eyeTestRoutes = require('./routes/eyeTestRoutes');
app.use('/api/eyetests', eyeTestRoutes);
app.use('/api/eye-test', eyeTestRoutes);

//license
const licenseRoutes = require('./routes/licenseRoutes');
app.use('/api/license', licenseRoutes);

//view print registerd

const reportRoutes = require('./routes/viewprintregisterRoutes');
app.use('/api', reportRoutes);

//notifications 
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);
app.use('/api', notificationRoutes); 

//repair requests

const repairRequestRoutes = require('./routes/repairRequestRoutes');
app.use('/api/repair-request', require('./routes/repairRequestRoutes'));

const repairRoutes = require('./routes/repairRequestRoutes');
app.use('/api/repairs', repairRoutes);
//app.use('/api/repair', repairRoutes);
//app.use('/api/repairRequestRoutes', require('./routes/repairRequestRoutes'));


// mechanic repair section

//const mechanicRepairRoutes = require('./routes/mechanicRepairRoutes');
//app.use('/api', mechanicRepairRoutes);

//stock register
const stockRoutes = require('./routes/stockRoutes');
app.use('/api/stockroutes', stockRoutes);
app.use('/api/stock', stockRoutes);

//Purchase
const purchaseRoutes = require('./routes/purchaseRoutes');
app.use('/api/purchases', purchaseRoutes);

//expense
const fuelReportRoutes = require('./routes/expenseRoutes');
app.use('/api/fuel', fuelReportRoutes);
//traineed details
const traineeRoutes = require('./routes/traineeRoutes');
app.use('/api/trainees', traineeRoutes);


// Fetch all unverified users
app.get('/api/unverified-users', async (req, res) => {
  try {
    const unverifiedUsers = await User.find(
  { verified: 'NO' },
  { email: 1, name: 1, pen: 1, generalNo: 1 } // to reduce loading time
);

    res.status(200).json(unverifiedUsers);
  } catch (err) {
    console.error('Error fetching unverified users:', err);
    res.status(500).json({ message: 'Error fetching unverified users', error: err.message });
  }
});


// ✅ New: Verify a user by PEN
app.put('/api/verify-user/pen/:pen', async (req, res) => {
  try {
    const pen = req.params.pen;
    const user = await User.findOneAndUpdate({ pen }, { verified: 'YES' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User verified successfully', user });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});



// view specific user details
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});


// Start server (only once)
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});


