import React, { useState, useEffect } from 'react';
import './css/userdashboard.css';
import { useNavigate } from 'react-router-dom'; 
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';

function UserDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    pen: '',
    generalNo: '',
    email: '',
    mobile: '',
    dob: '',
    licenseNo: '',
    bloodGroup: '',
    gender: '',
    profilePic: '',
    signature: '',
  });

  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = dayjs();

  const [movementData, setMovementData] = useState({
    vehicleNo: '',
    startingKm: '',
    startDate: defaultDate,
    startTime: defaultTime,
    destination: '',
    purpose: ''
  });

  useEffect(() => {
    setFormData({
      name: localStorage.getItem('userName'),
      pen: localStorage.getItem('userPen'),
      generalNo: localStorage.getItem('usergeneralNo'),
      email: localStorage.getItem('userEmail'),
      mobile: localStorage.getItem('userphone'),
      dob: localStorage.getItem('userdob'),
      licenseNo: localStorage.getItem('userlicenseNo'),
      bloodGroup: localStorage.getItem('userbloodGroup'),
      gender: localStorage.getItem('usergender'),
      profilePic: localStorage.getItem('userPhoto'),
      signature: localStorage.getItem('userSignature')
    });
  }, []);

   const handleLogout = () => {
    localStorage.clear();           // Clear all data
    navigate('/userlogin');        // Redirect to login page
  };


  const themeStyle = {
    background: darkMode ? '#121212' : '#fff',
    color: darkMode ? '#f1f1f1' : '#000',
    borderColor: darkMode ? '#555' : '#ccc'
  };

  const handleMovementChange = (e) => {
    const { name, value } = e.target;
    setMovementData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (newValue) => {
    setMovementData((prev) => ({ ...prev, startTime: newValue }));
  };

  const handleMovementSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/movement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleno: movementData.vehicleNo,
          startingkm: movementData.startingKm,
          startingdate: movementData.startDate,
          startingtime: movementData.startTime.format('HH:mm'),
          destination: movementData.destination,
          purpose: movementData.purpose,
          officerincharge: formData.name || '',
          closingkm: '',
          closingtime: ''
        })
      });

      const result = await res.json();
      if (res.ok) {
        alert('Trip Starting Details Saved Successfully');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert('Error submitting movement data: ' + err.message);
    }
  };

  return (
    <div className="dashboard" style={themeStyle}>
      <div className="sidebar">
        <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>

        <h2>WELCOME</h2>

        <div className="sidebar-buttons">
          <button className="sidebar-btn" onClick={() => setActiveTab('profile')}>Profile</button>
          {['Fuel', 'Repair', 'Movement', 'Eye Test', 'Accident', 'Vehicle Details'].map(label => (
            <button
              key={label}
              className="sidebar-btn"
              onClick={() => setActiveTab(label.toLowerCase())}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </div>

      <div className="main-content" style={themeStyle}>
        {activeTab === 'profile' && (
          <div className="form-section">
            <div className="form-left">
              {[
                { label: 'Name', name: 'name' },
                { label: 'PEN number', name: 'pen' },
                { label: 'General Number', name: 'generalNo' },
                { label: 'Email', name: 'email' },
                { label: 'Mobile Number', name: 'mobile' },
                { label: 'DOB', name: 'dob' },
                { label: 'Licence Number', name: 'licenseNo' },
                { label: 'Blood Group', name: 'bloodGroup' },
                { label: 'Gender', name: 'gender' },
              ].map(field => (
                <div className="form-group" key={field.name}>
                  <label>{field.label}</label>
                  <input type="text" value={formData[field.name] || ''} readOnly style={themeStyle} />
                </div>
              ))}
            </div>

            <div className="form-right">
              <div className="upload-section">
                <img
                  src={formData.profilePic || 'https://via.placeholder.com/100'}
                  alt="Profile"
                  className="upload-icon"
                />
                <p>Profile Photo</p>
              </div>
              <div className="upload-section">
                <img
                  src={formData.signature || 'https://via.placeholder.com/100'}
                  alt="Signature"
                  className="upload-icon"
                />
                <p>Signature</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'movement' && (
          <form onSubmit={handleMovementSubmit}>
            <h2>Movement Form</h2>

            <div className="form-group">
              <label>Vehicle Number</label>
              <input className="inputStyle"
                name="vehicleNo"
                type="text"
                value={movementData.vehicleNo}
                onChange={handleMovementChange}
                style={themeStyle}
              />
            </div>

            <div className="form-group">
              <label>Starting KM</label>
              <input
                name="startingKm"
                type="number"
                value={movementData.startingKm}
                onChange={handleMovementChange}
                style={themeStyle}
              />
            </div>

            <div className="form-group">
              <label>Starting Date</label>
              <input
                name="startDate"
                type="date"
                value={movementData.startDate}
                onChange={handleMovementChange}
                style={themeStyle}
              />
            </div>

            <div className="form-group">
              <label>Starting Time</label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Start Time"
                  value={movementData.startTime}
                  onChange={handleTimeChange}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                />
              </LocalizationProvider>
            </div>

            <div className="form-group">
              <label>Destination</label>
              <input
                name="destination"
                type="text"
                value={movementData.destination}
                onChange={handleMovementChange}
                style={themeStyle}
              />
            </div>

            <div className="form-group">
              <label>Purpose</label>
              <input
                name="purpose"
                type="text"
                value={movementData.purpose}
                onChange={handleMovementChange}
                style={themeStyle}
              />
            </div>

            <button type="submit">Submit Movement</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
