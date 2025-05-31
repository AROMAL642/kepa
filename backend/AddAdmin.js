const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

mongoose.connect('mongodb+srv://kepamotor:arya1234@cluster0.n6bhdzu.mongodb.net/kepa')
  .then(async () => {
    const dobString = '20-09-2003'; // original format
    const formattedDOB = new Date(dobString.split('-').reverse().join('-')); // converts to 2003-09-20

    const hashedPassword = await bcrypt.hash('admin1234', 10);

    const newAdmin = new Admin({
      pen: 'ADM003',
      generalNo: 'GEN003',
      name: 'SHAFRIN FATHIMA HS',
      email: 'fathimashafrin@gmail.com',
      phone: '9605389387',
      licenceNo: '987h89',
      dob: formattedDOB, // ✅ fixed
      gender: 'Female',
      bloodGroup: 'B+',
      password: hashedPassword,
      photo: '', // optional
      signature: '' // optional
    });

    await newAdmin.save();
    console.log('✅ Admin user created with hashed password.');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    mongoose.disconnect();
  });
