import React, { useState, useEffect } from 'react';
import ResponsiveAppBar from './admindashboardcomponents/ResponsiveAppBar';
import SkeletonChildren from './admindashboardcomponents/SkeletonUI';
import RepairAdmin from './repairsectiondashboardcomponents/RepairAdmin';
import VerifiedUserTable from './repairsectiondashboardcomponents/VerifiedUserTable';
//import FuelPendingRequest from './fuelsectiondashboardcomponents/fuelpendingrequest';
//import SearchVehicleDetails from './admindashboardcomponents/SearchVehicleDetails';

import './css/admindashboard.css';
import './css/fueladmin.css';

function RepairDashboard() {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [repairData, setRepairData] = useState({
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
    setRepairData({
      name: localStorage.getItem('repairName') || '',
      email: localStorage.getItem('repairEmail') || '',
      pen: localStorage.getItem('repairPen') || '',
      mobile: localStorage.getItem('repairPhone') || '',
      dob: (localStorage.getItem('repairDob') || '').substring(0, 10),
      licenseNo: localStorage.getItem('repairLicenseNo') || '',
      bloodGroup: localStorage.getItem('repairBloodGroup') || '',
      gender: localStorage.getItem('repairGender') || '',
      photo: localStorage.getItem('repairPhoto') || '',
      signature: localStorage.getItem('repairSignature') || '',
      role: localStorage.getItem('repairRole') || ''
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
        photo={repairData.photo} 
        name={repairData.name} 
        role={repairData.role} 
      />

      <button className="drawer-toggle-btn" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
        ☰
      </button>

      <div className={`dashboard ${isDrawerOpen ? 'drawer-open' : ''}`}>
        {/* Sidebar Drawer */}
        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
         

          <h2>REPAIR SECTION</h2>
          {repairData.role && (
            <div className="role-badge" style={{ 
              background: '#4CAF50', 
              color: 'white', 
              padding: '5px 10px', 
              borderRadius: '20px',
              marginBottom: '15px',
              fontSize: '0.9rem'
            }}>
              {repairData.role}
            </div>
          )}

          <div className="sidebar-buttons">
            <button className={`sidebar-btn ${activeTab === 'repair' ? 'active' : ''}`} onClick={() => setActiveTab('fuel')}>Repair Entry Review</button>
            <button className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
            <button className={`sidebar-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>View Pending Requests</button>
            <button className={`sidebar-btn ${activeTab === 'vehicle' ? 'active' : ''}`} onClick={() => setActiveTab('vehicle')}>Vehicle Details</button>
            <button className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users Details</button>
            <button className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('escertif')}>Essentiality Certificate</button>
            <button className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('techcertf')}>Technical Certificate</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content" >

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
                        value={repairData.dob}
                        onChange={(e) =>
                          setRepairData((prev) => ({ ...prev, dob: e.target.value }))
                        }
                        
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        name={field.name}
                        value={repairData[field.name] || ''}
                        readOnly={!editMode || field.readOnly}
                        onChange={(e) =>
                          setRepairData((prev) => ({ ...prev, [field.name]: e.target.value }))
                        }
                      
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
                            body: JSON.stringify(repairData),
                          });

                          const data = await response.json();
                          if (response.ok) {
                            // Save to localStorage
                            localStorage.setItem('repairName', data.updatedUser.name || '');
                            localStorage.setItem('repairPen', data.updatedUser.pen || '');
                            localStorage.setItem('repairEmail', data.updatedUser.email || '');
                            localStorage.setItem('repairPhone', data.updatedUser.phone || '');
                            localStorage.setItem('repairDob', (data.updatedUser.dob || '').substring(0, 10));
                            localStorage.setItem('repairLicenseNo', data.updatedUser.licenseNo || '');
                            localStorage.setItem('repairBloodGroup', data.updatedUser.bloodGroup || '');
                            localStorage.setItem('repairGender', data.updatedUser.gender || '');
                            localStorage.setItem('repairPhoto', data.updatedUser.photo || '');
                            localStorage.setItem('repairSignature', data.updatedUser.signature || '');
                            localStorage.setItem('repairRole', data.updatedUser.role || '');

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
                  <img src={repairData.photo || 'https://via.placeholder.com/100'} alt="Profile" className="upload-icon" />
                  <p>Profile Photo</p>
                </div>
                <div className="upload-section">
                  <img src={repairData.signature || 'https://via.placeholder.com/100'} alt="Signature" className="upload-icon" />
                  <p>Signature</p>
                </div>
              </div>
            </div>
          )}

          {/*
          {activeTab === 'pending' && (
            <div style={{ padding: '20px' }}>
              <h2>Pending Repair Requests</h2>
              <RepairPendingRequest darkMode={darkMode} />
            </div>
          )}
        

          {activeTab === 'vehicle' && (
            <div style={{ padding: '20px' }}>
              <SearchVehicleDetails darkMode={darkMode} />
            </div>
          )}
          */}

          {activeTab === 'users' && (
            <div style={{ padding: '20px' }}>
              <VerifiedUserTable  />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RepairDashboard;
