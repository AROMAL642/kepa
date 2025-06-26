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
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [newSignatureFile, setNewSignatureFile] = useState(null);

  const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};


  const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 100 * 1024) {
    alert('Photo must be less than 100KB');
    return;
  }
  const base64 = await toBase64(file);
  setFuelData(prev => ({ ...prev, photo: base64 }));
  setNewPhotoFile(file);
};

const handleSignatureChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 100 * 1024) {
    alert('Signature must be less than 100KB');
    return;
  }
  const base64 = await toBase64(file);
  setFuelData(prev => ({ ...prev, signature: base64 }));
  setNewSignatureFile(file);
};


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
    const formDataObj = new FormData();
    formDataObj.append('pen', fuelData.pen);
    formDataObj.append('name', fuelData.name);
    formDataObj.append('email', fuelData.email);
    formDataObj.append('phone', fuelData.mobile);
    formDataObj.append('dob', fuelData.dob);
    formDataObj.append('licenseNo', fuelData.licenseNo);

    if (newPhotoFile) {
      formDataObj.append('photo', newPhotoFile);
    } else if (fuelData.photo) {
      formDataObj.append('photo', fuelData.photo);
    }

    if (newSignatureFile) {
      formDataObj.append('signature', newSignatureFile);
    } else if (fuelData.signature) {
      formDataObj.append('signature', fuelData.signature);
    }

    const response = await fetch('http://localhost:5000/api/users/update-admin', {
      method: 'PUT',
      body: formDataObj,
    });

    const data = await response.json();
    if (response.ok) {
      const updated = data;
      localStorage.setItem('fuelName', updated.name || '');
      localStorage.setItem('fuelPen', updated.pen || '');
      localStorage.setItem('fuelEmail', updated.email || '');
      localStorage.setItem('fuelPhone', updated.phone || '');
      localStorage.setItem('fuelDob', (updated.dob || '').substring(0, 10));
      localStorage.setItem('fuelLicenseNo', updated.licenseNo || '');
      localStorage.setItem('fuelBloodGroup', updated.bloodGroup || '');
      localStorage.setItem('fuelGender', updated.gender || '');
      localStorage.setItem('fuelPhoto', updated.photo || '');
      localStorage.setItem('fuelSignature', updated.signature || '');
      localStorage.setItem('fuelRole', updated.role || '');

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
    {editMode && (
      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        style={{ marginTop: '8px' }}
      />
    )}
  </div>
  <div className="upload-section">
    <img
      src={fuelData.signature || 'https://via.placeholder.com/100'}
      alt="Signature"
      className="upload-icon"
    />
    <p>Signature</p>
    {editMode && (
      <input
        type="file"
        accept="image/*"
        onChange={handleSignatureChange}
        style={{ marginTop: '8px' }}
      />
    )}
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
