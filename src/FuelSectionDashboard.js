import React, { useState, useEffect } from 'react';
import ResponsiveAppBar from './admindashboardcomponents/ResponsiveAppBar';
import SkeletonChildren from './admindashboardcomponents/SkeletonUI';
import FuelAdmin from './fuelsectiondashboardcomponents/FuelAdmin';
import FuelPendingRequest from './fuelsectiondashboardcomponents/fuelpendingrequest';
import SearchVehicleDetails from './fuelsectiondashboardcomponents/SearchVehicleDetails';
import VerifiedUsersTable from './fuelsectiondashboardcomponents/VerifiedUsersTable';
import './css/admindashboard.css';
import './css/fueladmin.css';

import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GroupIcon from '@mui/icons-material/Group';


function FuelDashboard() {
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
  isDrawerOpen={isDrawerOpen}
  onDrawerToggle={() => setIsDrawerOpen(!isDrawerOpen)}
  onSelectTab={(tab) => setActiveTab(tab)} 
/>

      <button className="drawer-toggle-btn" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
        ☰
      </button>

      <div className={`dashboard ${isDrawerOpen ? 'drawer-open' : ''}`}>
        {/* Sidebar Drawer */}
        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
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
  <button className={`sidebar-btn ${activeTab === 'fuel' ? 'active' : ''}`} onClick={() => setActiveTab('fuel')}>
    <LocalGasStationIcon style={{ marginRight: '8px' }} /> Fuel Entry Review
  </button>
  <button className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
    <AccountCircleIcon style={{ marginRight: '8px' }} /> Profile
  </button>
  <button className={`sidebar-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
    <PendingActionsIcon style={{ marginRight: '8px' }} /> View Pending Requests
  </button>
  <button className={`sidebar-btn ${activeTab === 'vehicle' ? 'active' : ''}`} onClick={() => setActiveTab('vehicle')}>
    <DirectionsCarIcon style={{ marginRight: '8px' }} /> Vehicle Details
  </button>
  <button className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
    <GroupIcon style={{ marginRight: '8px' }} /> Users Details
  </button>
</div>

        </div>

        {/* Main Content */}
        <div className="main-content">
          {activeTab === 'fuel' && <FuelAdmin />}

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

export default FuelDashboard;
