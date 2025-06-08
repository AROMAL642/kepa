import React, { useState, useEffect } from 'react';
import ResponsiveAppBar from './admindashboardcomponents/ResponsiveAppBar';
import SkeletonChildren from './admindashboardcomponents/SkeletonUI';
import FuelAdmin from './fuelsectiondashboardcomponents/FuelAdmin';
import FuelPendingRequest from './fuelsectiondashboardcomponents/fuelpendingrequest';
import SearchVehicleDetails from './admindashboardcomponents/SearchVehicleDetails';
import VerifiedUsersTable from './fuelsectiondashboardcomponents/VerifiedUsersTable';

import './css/admindashboard.css';
import './css/fueladmin.css';

function FuelDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [fuelData, setFuelData] = useState({
    name: '',
    email: '',
    pen: '',
    mobile: '',
    dob: '',
    licenseNo: '',
    bloodGroup: '',
    gender: '',
    photo: '',
    signature: '',
    role: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setFuelData({
      name: localStorage.getItem('fuelName') || '',
      email: localStorage.getItem('fuelEmail') || '',
      pen: localStorage.getItem('fuelPen') || '',
      mobile: localStorage.getItem('fuelPhone') || '',
      dob: (localStorage.getItem('fuelDob') || '').substring(0, 10),
      licenseNo: localStorage.getItem('fuelLicenseNo') || '',
      bloodGroup: localStorage.getItem('fuelBloodGroup') || '',
      gender: localStorage.getItem('fuelGender') || '',
      photo: localStorage.getItem('fuelPhoto') || '',
      signature: localStorage.getItem('fuelSignature') || '',
      role: localStorage.getItem('fuelRole') || ''
    });
  }, []);

  const themeStyle = {
    background: darkMode ? '#121212' : '#fff',
    color: darkMode ? '#f1f1f1' : '#000',
    borderColor: darkMode ? '#555' : '#ccc'
  };

  if (loading) {
    return (
      <div style={{ padding: '40px' }}>
        <SkeletonChildren />
      </div>
    );
  }

  return (
    <div>
      <ResponsiveAppBar 
        photo={fuelData.photo} 
        name={fuelData.name} 
        role={fuelData.role} 
      />

      <button className="drawer-toggle-btn" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
        ☰
      </button>

      <div className={`dashboard ${isDrawerOpen ? 'drawer-open' : ''}`} style={themeStyle}>
        {/* Sidebar Drawer */}
        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
          <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          <h2>FUEL SECTION</h2>
          {fuelData.role && (
            <div className="role-badge" style={{ 
              background: '#4CAF50', 
              color: 'white', 
              padding: '5px 10px', 
              borderRadius: '20px',
              marginBottom: '15px',
              fontSize: '0.9rem'
            }}>
              {fuelData.role}
            </div>
          )}

          <div className="sidebar-buttons">
            <button className={`sidebar-btn ${activeTab === 'fuel' ? 'active' : ''}`} onClick={() => setActiveTab('fuel')}>Fuel Entry Review</button>
            <button className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
            <button className={`sidebar-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>View Pending Requests</button>
            <button className={`sidebar-btn ${activeTab === 'vehicle' ? 'active' : ''}`} onClick={() => setActiveTab('vehicle')}>Vehicle Details</button>
            <button className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users Details</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content" style={themeStyle}>
          {activeTab === 'fuel' && <FuelAdmin darkMode={darkMode} />}

          {activeTab === 'profile' && (
            <div className="form-section">
              <div className="form-left">
                {[
                  { label: 'Name', name: 'name' },
                  { label: 'PEN Number', name: 'pen', readOnly: true },
                  { label: 'Email', name: 'email' },
                  { label: 'Mobile Number', name: 'mobile' },
                  { label: 'Date of Birth', name: 'dob', type: 'date' },
                  { label: 'License Number', name: 'licenseNo' },
                  { label: 'Blood Group', name: 'bloodGroup', readOnly: true },
                  { label: 'Gender', name: 'gender', readOnly: true },
                  { label: 'Role', name: 'role', readOnly: true }
                ].map(field => (
                  <div className="form-group" key={field.name}>
                    <label>{field.label}</label>
                    {editMode && field.name === 'dob' ? (
                      <input
                        type="date"
                        name="dob"
                        value={fuelData.dob}
                        onChange={(e) =>
                          setFuelData((prev) => ({ ...prev, dob: e.target.value }))
                        }
                        style={themeStyle}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        name={field.name}
                        value={fuelData[field.name] || ''}
                        readOnly={!editMode || field.readOnly}
                        onChange={(e) =>
                          setFuelData((prev) => ({ ...prev, [field.name]: e.target.value }))
                        }
                        style={themeStyle}
                      />
                    )}
                  </div>
                ))}

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
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(fuelData),
                          });

                          const data = await response.json();
                          if (response.ok) {
                            // Save to localStorage
                            localStorage.setItem('fuelName', data.updatedUser.name || '');
                            localStorage.setItem('fuelPen', data.updatedUser.pen || '');
                            localStorage.setItem('fuelEmail', data.updatedUser.email || '');
                            localStorage.setItem('fuelPhone', data.updatedUser.phone || '');
                            localStorage.setItem('fuelDob', (data.updatedUser.dob || '').substring(0, 10));
                            localStorage.setItem('fuelLicenseNo', data.updatedUser.licenseNo || '');
                            localStorage.setItem('fuelBloodGroup', data.updatedUser.bloodGroup || '');
                            localStorage.setItem('fuelGender', data.updatedUser.gender || '');
                            localStorage.setItem('fuelPhoto', data.updatedUser.photo || '');
                            localStorage.setItem('fuelSignature', data.updatedUser.signature || '');
                            localStorage.setItem('fuelRole', data.updatedUser.role || '');

                            alert('Profile updated successfully');
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
                    src={fuelData.photo || 'https://via.placeholder.com/100'}
                    alt="Profile"
                    className="upload-icon"
                  />
                  <p>Profile Photo</p>
                </div>
                <div className="upload-section">
                  <img
                    src={fuelData.signature || 'https://via.placeholder.com/100'}
                    alt="Signature"
                    className="upload-icon"
                  />
                  <p>Signature</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div style={{ padding: '20px' }}>
              <h2>Pending Fuel Requests</h2>
              <FuelPendingRequest darkMode={darkMode} />
            </div>
          )}

          {activeTab === 'vehicle' && (
            <div style={{ padding: '20px' }}>
              <SearchVehicleDetails darkMode={darkMode} />
            </div>
          )}

          {activeTab === 'users' && (
            <div style={{ padding: '20px' }}>
              <VerifiedUsersTable themeStyle={themeStyle} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FuelDashboard;
