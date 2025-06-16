import React, { useState, useEffect } from 'react';
import ResponsiveAppBar from './admindashboardcomponents/ResponsiveAppBar';
import SkeletonChildren from './admindashboardcomponents/SkeletonUI';
//import VerifiedUserTable from './repairsectiondashboardcomponents/VerifiedUserTable';
//import FuelPendingRequest from './fuelsectiondashboardcomponents/fuelpendingrequest';
//import SearchVehicleDetails from './admindashboardcomponents/SearchVehicleDetails';

import './css/admindashboard.css';
import './css/fueladmin.css';

function RepairDashboard() {
  //const [editMode, setEditMode] = useState(false);
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
    pen: localStorage.getItem('repairPen') || '',
    email: localStorage.getItem('repairEmail') || '',
    mobile: localStorage.getItem('repairMobile') || '',
    dob: localStorage.getItem('repairDob') || '',
    licenseNo: localStorage.getItem('repairLicenseNo') || '',
    bloodGroup: localStorage.getItem('repairBloodGroup') || '',
    gender: localStorage.getItem('repairGender') || '',
    role: localStorage.getItem('repairRole') || '',
    photo: localStorage.getItem('repairPhoto') || '',
    signature: localStorage.getItem('repairSignature') || '',
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
            <button className={`sidebar-btn ${activeTab === 'escertif' ? 'active' : ''}`} onClick={() => setActiveTab('escertif')}>Essentiality Certificate</button>
            <button className={`sidebar-btn ${activeTab === 'techcert' ? 'active' : ''}`} onClick={() => setActiveTab('techcertf')}>Technical Certificate</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content" >

{/* Always Show Name and Photo on Sidebar or Top */}
<div className="profile-summary" style={{ padding: '20px', textAlign: 'center' }}>
  <img 
    src={repairData.photo || 'https://via.placeholder.com/80'} 
    alt="Profile" 
    style={{ width: '80px', height: '80px', borderRadius: '50%' }} 
  />
  <h4 style={{ marginTop: '10px', color: 'white' }}>{repairData.name || 'Admin'}</h4>
  <img 
    src={repairData.signature || 'https://via.placeholder.com/100'} 
    alt="Signature" 
    style={{ marginTop: '10px', maxWidth: '100px' }} 
  />
</div>
{activeTab === 'profile' && (
  <div className="form-section">
    <div className="form-left">
      <div className="form-group">
        <label>Name</label>
        <input type="text" name="name" value={repairData.name} readOnly />
      </div>
      <div className="form-group">
        <label>PEN Number</label>
        <input type="text" name="pen" value={repairData.pen} readOnly />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="text" name="email" value={repairData.email} readOnly />
      </div>
      <div className="form-group">
        <label>Mobile Number</label>
        <input type="text" name="mobile" value={repairData.mobile} readOnly />
      </div>
      <div className="form-group">
        <label>Date of Birth</label>
        <input type="text" name="dob" value={repairData.dob} readOnly />
      </div>
      <div className="form-group">
        <label>License Number</label>
        <input type="text" name="licenseNo" value={repairData.licenseNo} readOnly />
      </div>
      <div className="form-group">
        <label>Blood Group</label>
        <input type="text" name="bloodGroup" value={repairData.bloodGroup} readOnly />
      </div>
      <div className="form-group">
        <label>Gender</label>
        <input type="text" name="gender" value={repairData.gender} readOnly />
      </div>
      <div className="form-group">
        <label>Role</label>
        <input type="text" name="role" value={repairData.role} readOnly />
      </div>
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
              
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

export default RepairDashboard;