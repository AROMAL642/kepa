import React, { useState, useEffect } from 'react';
import './css/userdashboard.css';
import MovementRegister from './userdashboardcomponents/MovementRegister';
import SearchVehicleDetails from './userdashboardcomponents/SearchVehicleDetails';
import { useNavigate } from 'react-router-dom';
import './css/movement.css';
import './css/SearchVehicleDetails.css';
import FuelRegister from './userdashboardcomponents/FuelRegister';
import RepairRequestForm from './RepairRequestForm';



function UserDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);


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
    role: '',
    photo: '',
    signature: '',
  });

  
  useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    setFormData({
      name: user.name,
      pen: user.pen,
      generalNo: user.generalNo,
      email: user.email,
      mobile: user.phone,
      dob: user.dob,
      licenseNo: user.licenseNo,
      bloodGroup: user.bloodGroup,
      gender: user.gender,
      profilePic: user.photo,
      signature: user.signature
    });
  }
}, []);



  const handleLogout = () => {
    localStorage.clear();
    navigate('/userlogin');
  };

  const themeStyle = {
    background: darkMode ? '#121212' : '#fff',
    color: darkMode ? '#f1f1f1' : '#000',
    borderColor: darkMode ? '#555' : '#ccc'

  };

  

  return (
    <>
      <button className="drawer-toggle-btn" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
        ☰
      </button>
      <div className={`dashboard ${isDrawerOpen ? 'drawer-open' : ''}`} style={themeStyle}>
        {/* Sidebar Drawer */}
        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
          
          <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          <h2>Welcome {formData.name || 'User'}!</h2>

          <div className="sidebar-buttons">
            <button className="sidebar-btn" onClick={() => setActiveTab('profile')}>Profile</button>
            {['Fuel', 'Repair', 'Movement', 'Eye Test', 'Accident', 'vehicle details'].map(label => (
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

        {/* Main Content Area */}
        <div className="main-content" style={themeStyle}>
          {/* Profile Tab */}
         
            {activeTab === 'profile' && (
  <div className="form-section">
    <div className="form-left">
      {[
        { label: 'Name', name: 'name', readOnly: true },
        { label: 'PEN number', name: 'pen', readOnly: true },
        { label: 'General Number', name: 'generalNo', readOnly: true },
        { label: 'Email', name: 'email' },
        { label: 'Mobile Number', name: 'mobile' },
        { label: 'DOB', name: 'dob', readOnly: true },
        { label: 'Licence Number', name: 'licenseNo' },
        { label: 'Blood Group', name: 'bloodGroup', readOnly: true },
        { label: 'Gender', name: 'gender', readOnly: true },
      ].map(field => (
        <div className="form-group" key={field.name}>
          <label>{field.label}</label>
          <input
            type="text"
            name={field.name}
            value={formData[field.name] || ''}
            readOnly={!editMode || field.readOnly}
            onChange={e =>
              setFormData(prev => ({ ...prev, [field.name]: e.target.value }))
            }
            style={themeStyle}
          />
        </div>
      ))}

      {/* Toggle/Edit Buttons */}
      {!editMode ? (
        <button className="submit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
      ) : (
        <>
          <button
            className="save-btn"
            onClick={async () => {
              try {
                const response = await fetch('http://localhost:5000/api/users/update', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(formData),
                });

                const data = await response.json();
                if (response.ok) {
                  alert('Profile updated successfully');
                  localStorage.setItem('user', JSON.stringify(data.updatedUser));
                  setEditMode(false);
                } else {
                  alert(data.message || 'Update failed');
                }
              } catch (error) {
                alert('An error occurred while updating');
                console.error(error);
              }
            }}
          >
            Save Changes
          </button>
          <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
        </>
      )}
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

          {/* Movement Tab */}
          {activeTab === 'movement' && (
            <div className="movement-section">
              <MovementRegister />
            </div>
          )}

          {/* Vehicle Details Tab */}
          {activeTab === 'vehicle details' && (
            <div className="vehicle-details-section">
              <SearchVehicleDetails />
            </div>
          )}

          {activeTab === 'fuel' && 
             <FuelRegister darkMode={darkMode} pen={formData.pen} />
          }

          {/* Repair Tab */}
          {activeTab === 'repair' && (
            <div className="repair-request-section">
              <RepairRequestForm darkMode={darkMode} />
            </div>
          )}



        </div>
      </div>
    </>
  );
}

export default UserDashboard;
