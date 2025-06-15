import React, { useState, useEffect } from 'react';
import ResponsiveAppBar from './admindashboardcomponents/ResponsiveAppBar';
import SkeletonChildren from './admindashboardcomponents/SkeletonUI';
import FuelPendingRequest from './fuelsectiondashboardcomponents/fuelpendingrequest';
import SearchVehicleDetails from './mechanicdashboardcomponents/SearchVehicleDetails';
import VerifiedUsersTable from './mechanicdashboardcomponents/VerifiedUsersTable';

import './css/admindashboard.css';
import './css/fueladmin.css';

function MechanicDashboard() {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [mechanicData, setMechanicData] = useState({
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
    setMechanicData({
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
          photo={mechanicData.photo} 
        name={mechanicData.name} 
        role={mechanicData.role}
          isDrawerOpen={isDrawerOpen}
          onDrawerToggle={() => setIsDrawerOpen(!isDrawerOpen)}
          onSelectTab={(tab) => setActiveTab(tab)}

      />

      <button className="drawer-toggle-btn" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
        ☰
      </button>

      <div className={`dashboard ${isDrawerOpen ? 'drawer-open' : ''}`}>
        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
          <h2>MECHANIC SECTION</h2>
          {mechanicData.role && (
            <div className="role-badge" style={{ 
              background: '#4CAF50', 
              color: 'white', 
              padding: '5px 10px', 
              borderRadius: '20px',
              marginBottom: '15px',
              fontSize: '0.9rem'
            }}>
              {mechanicData.role}
            </div>
          )}

          <div className="sidebar-buttons">
            <button className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
            <button className={`sidebar-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>View Pending Requests</button>
            <button className={`sidebar-btn ${activeTab === 'vehicle' ? 'active' : ''}`} onClick={() => setActiveTab('vehicle')}>Vehicle Details</button>
            <button className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users Details</button>
          </div>
        </div>

        <div className="main-content">
          {activeTab === 'profile' && (
            <div className="form-section">
              <div className="form-left">
                {[{ label: 'Name', name: 'name' },
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
                        value={mechanicData.dob}
                        onChange={(e) => setMechanicData(prev => ({ ...prev, dob: e.target.value }))}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        name={field.name}
                        value={mechanicData[field.name] || ''}
                        readOnly={!editMode || field.readOnly}
                        onChange={(e) => setMechanicData(prev => ({ ...prev, [field.name]: e.target.value }))}
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
                            body: JSON.stringify(mechanicData),
                          });

                          const data = await response.json();
                          if (response.ok) {
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
                  <img src={mechanicData.photo || 'https://via.placeholder.com/100'} alt="Profile" className="upload-icon" />
                  <p>Profile Photo</p>
                </div>
                <div className="upload-section">
                  <img src={mechanicData.signature || 'https://via.placeholder.com/100'} alt="Signature" className="upload-icon" />
                  <p>Signature</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div style={{ padding: '20px' }}>
              <h2>Pending Fuel Requests</h2>
              <FuelPendingRequest />
            </div>
          )}

          {activeTab === 'vehicle' && (
            <div style={{ padding: '20px' }}>
              <SearchVehicleDetails />
            </div>
          )}

          {activeTab === 'users' && (
            <div style={{ padding: '20px' }}>
              <VerifiedUsersTable />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MechanicDashboard;
