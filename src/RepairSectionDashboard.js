import React, { useState, useEffect } from 'react';
import ResponsiveAppBar from './admindashboardcomponents/ResponsiveAppBar';
import SkeletonChildren from './admindashboardcomponents/SkeletonUI';
import SearchVehicleDetails from './repairsectiondashboardcomponents/SearchVehicleDetails';
import VerifiedUsersTable from './fuelsectiondashboardcomponents/VerifiedUsersTable';
import RepairPendingRequest from './repairsectiondashboardcomponents/RepairPendingRequest';
import './css/admindashboard.css';
import './css/fueladmin.css';

import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

const RepairEntryReview = () => <div style={{ padding: '20px' }}>Repair Entry Review Placeholder</div>;
const EssentialityCertificate = () => <div style={{ padding: '20px' }}>Essentiality Certificate Placeholder</div>;
const TechnicalCertificate = () => <div style={{ padding: '20px' }}>Technical Certificate Placeholder</div>;

function RepairDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [newSignatureFile, setNewSignatureFile] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

useEffect(() => {
  const fetchPendingRequestsCount = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/repair-request');
      const data = await res.json();
      const count = data.filter(req => req.status === 'forwarded_to_repair_section').length;
      setPendingCount(count);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    }
  };

  fetchPendingRequestsCount();

  // Optional: Poll every minute
  const interval = setInterval(fetchPendingRequestsCount, 60000);
  return () => clearInterval(interval);
}, []);

  

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
  setRepairData(prev => ({ ...prev, photo: base64 }));
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
  setRepairData(prev => ({ ...prev, signature: base64 }));
  setNewSignatureFile(file);
};


  const [repairData, setRepairData] = useState({
    name: '',
    email: '',
    pen: '',
    phone: '',
    dob: '',
    licenseNo: '',
    bloodGroup: '',
    gender: '',
    photo: '',
    signature: '',
    role: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setRepairData({
      name: localStorage.getItem('repairName') || '',
      email: localStorage.getItem('repairEmail') || '',
      pen: localStorage.getItem('repairPen') || '',
      phone: localStorage.getItem('repairPhone') || '',
      dob: (localStorage.getItem('repairDob') || '').substring(0, 10),
      licenseNo: localStorage.getItem('repairLicenseNo') || '',
      bloodGroup: localStorage.getItem('repairBloodGroup') || '',
      gender: localStorage.getItem('repairGender') || '',
      photo: localStorage.getItem('repairPhoto') || '',
      signature: localStorage.getItem('repairSignature') || '',
      role: localStorage.getItem('repairRole') || ''
    });
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setRepairData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

 const handleSave = async () => {
  try {
    const formDataObj = new FormData();
    formDataObj.append('pen', repairData.pen);
    formDataObj.append('name', repairData.name);
    formDataObj.append('email', repairData.email);
    formDataObj.append('phone', repairData.phone);
    formDataObj.append('dob', repairData.dob);
    formDataObj.append('licenseNo', repairData.licenseNo);

    if (newPhotoFile) {
      formDataObj.append('photo', newPhotoFile);
    } else if (repairData.photo) {
      formDataObj.append('photo', repairData.photo);
    }

    if (newSignatureFile) {
      formDataObj.append('signature', newSignatureFile);
    } else if (repairData.signature) {
      formDataObj.append('signature', repairData.signature);
    }

    const response = await fetch('http://localhost:5000/api/users/update-admin', {
      method: 'PUT',
      body: formDataObj,
    });

    const data = await response.json();

    if (response.ok) {
      const updated = data;

      // Update localStorage
      Object.entries(updated).forEach(([key, value]) => {
        if (key === 'dob') {
          localStorage.setItem(`repair${capitalize(key)}`, (value || '').substring(0, 10));
        } else {
          localStorage.setItem(`repair${capitalize(key)}`, value || '');
        }
      });

      setRepairData(prev => ({
        ...prev,
        ...updated,
        dob: (updated.dob || '').substring(0, 10)
      }));

      alert('Profile updated successfully');
      setIsEditing(false);
    } else {
      alert(data.message || 'Update failed');
    }
  } catch (err) {
    alert('Error while updating profile');
    console.error(err);
  }
};


  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  if (loading) {
    return <div style={{ padding: '40px' }}><SkeletonChildren /></div>;
  }

  return (
    <div>
      <ResponsiveAppBar
        photo={repairData.photo}
        name={repairData.name}
        role={repairData.role}
        isDrawerOpen={isDrawerOpen}
        onDrawerToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        onSelectTab={setActiveTab}
      />

      <button className="drawer-toggle-btn" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>☰</button>

      <div className={`dashboard ${isDrawerOpen ? 'drawer-open' : ''}`}>
        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
          <h2>REPAIR SECTION</h2>
          {repairData.role && (
            <div className="role-badge" style={{
              background: '#4CAF50', color: 'white', padding: '5px 10px',
              borderRadius: '20px', marginBottom: '15px', fontSize: '0.9rem'
            }}>{repairData.role}</div>
          )}
          <div className="sidebar-buttons">
            <button className={`sidebar-btn ${activeTab === 'repair' ? 'active' : ''}`} onClick={() => setActiveTab('repair')}>
              <BuildIcon fontSize="small" style={{ marginRight: '8px' }} />
              Repair Entry Review
            </button>

            <button className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <PersonIcon fontSize="small" style={{ marginRight: '8px' }} />
              Profile
            </button>
<button
  className={`sidebar-btn ${activeTab === 'pending' ? 'active' : ''}`}
  onClick={() => setActiveTab('pending')}
  style={{ position: 'relative', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
>
  <span className="icon-label-wrapper">
    <DescriptionIcon fontSize="small" style={{ marginRight: '8px' }} />
    View Pending Requests
  </span>
  {pendingCount > 0 && (
    <span className="notification-badge">
      {pendingCount}
    </span>
  )}
</button>



            <button className={`sidebar-btn ${activeTab === 'vehicle' ? 'active' : ''}`} onClick={() => setActiveTab('vehicle')}>
              <DirectionsCarIcon fontSize="small" style={{ marginRight: '8px' }} />
              Vehicle Details
            </button>

            <button className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
              <GroupIcon fontSize="small" style={{ marginRight: '8px' }} />
              Users Details
            </button>

            <button className={`sidebar-btn ${activeTab === 'escertif' ? 'active' : ''}`} onClick={() => setActiveTab('escertif')}>
              <DescriptionIcon fontSize="small" style={{ marginRight: '8px' }} />
              Essentiality Certificate
            </button>

            <button className={`sidebar-btn ${activeTab === 'techcert' ? 'active' : ''}`} onClick={() => setActiveTab('techcert')}>
              <SettingsSuggestIcon fontSize="small" style={{ marginRight: '8px' }} />
              Technical Certificate
            </button>
          </div>
        </div>

        <div className="main-content">
          {activeTab === 'repair' && <RepairEntryReview />}

          {activeTab === 'profile' && (
            <div className="form-section">
              <div className="form-left">
                {[
                  { label: 'Name', name: 'name' },
                  { label: 'PEN Number', name: 'pen', readOnly: true },
                  { label: 'Email', name: 'email' },
                  { label: 'Mobile', name: 'phone' },
                  { label: 'Date of Birth', name: 'dob', type: 'date' },
                  { label: 'License Number', name: 'licenseNo' },
                  { label: 'Blood Group', name: 'bloodGroup', readOnly: true },
                  { label: 'Gender', name: 'gender', readOnly: true },
                  { label: 'Role', name: 'role', readOnly: true },
                ].map(({ label, name, type = 'text', readOnly = false }) => (
                  <div className="form-group" key={name}>
                    <label>{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={repairData[name] || ''}
                      readOnly={!isEditing || readOnly}
                      onChange={handleEditChange}
                    />
                  </div>
                ))}

                <button onClick={handleEditToggle} className="submit-btn">
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                {isEditing && (
                  <button onClick={handleSave} className="save-btn">Save</button>
                )}
              </div>

              <div className="form-right">
  <div className="upload-section">
    <img src={repairData.photo || 'https://via.placeholder.com/100'} alt="Profile" className="upload-icon" />
    <p>Profile Photo</p>
    {isEditing && (
      <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ marginTop: '8px' }} />
    )}
  </div>
  <div className="upload-section">
    <img src={repairData.signature || 'https://via.placeholder.com/100'} alt="Signature" className="upload-icon" />
    <p>Signature</p>
    {isEditing && (
      <input type="file" accept="image/*" onChange={handleSignatureChange} style={{ marginTop: '8px' }} />
    )}
  </div>
</div>

            </div>
          )}

          {activeTab === 'pending' && (
            <div style={{ padding: '20px' }}>
              <h2>Pending Repair Requests</h2>
              <RepairPendingRequest />
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

          {activeTab === 'escertif' && (
            <EssentialityCertificate />
          )}

          {activeTab === 'techcert' && (
            <TechnicalCertificate />
          )}
        </div>
      </div>
    </div>
  );
}

export default RepairDashboard;
