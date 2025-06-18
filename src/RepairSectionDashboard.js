import React, { useState, useEffect } from 'react';
import ResponsiveAppBar from './admindashboardcomponents/ResponsiveAppBar';
import SkeletonChildren from './admindashboardcomponents/SkeletonUI';
import SearchVehicleDetails from './repairsectiondashboardcomponents/SearchVehicleDetails';
import VerifiedUsersTable from './fuelsectiondashboardcomponents/VerifiedUsersTable';
import RepairPendingRequest from './repairsectiondashboardcomponents/RepairPendingRequest';

import './css/admindashboard.css';
import './css/fueladmin.css';

const RepairEntryReview = () => <div>Repair Entry Review Placeholder</div>;
const EssentialityCertificate = () => <div>Essentiality Certificate Placeholder</div>;
const TechnicalCertificate = () => <div>Technical Certificate Placeholder</div>;

function RepairDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
      const response = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(repairData),
      });

      const data = await response.json();
      if (response.ok) {
        const updated = data.updatedUser;

        localStorage.setItem('repairName', updated.name || '');
        localStorage.setItem('repairPen', updated.pen || '');
        localStorage.setItem('repairEmail', updated.email || '');
        localStorage.setItem('repairPhone', updated.phone || '');
        localStorage.setItem('repairDob', (updated.dob || '').substring(0, 10));
        localStorage.setItem('repairLicenseNo', updated.licenseNo || '');
        localStorage.setItem('repairBloodGroup', updated.bloodGroup || '');
        localStorage.setItem('repairGender', updated.gender || '');
        localStorage.setItem('repairPhoto', updated.photo || '');
        localStorage.setItem('repairSignature', updated.signature || '');
        localStorage.setItem('repairRole', updated.role || '');

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
        onSelectTab={(tab) => setActiveTab(tab)}
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
            <button className={`sidebar-btn ${activeTab === 'repair' ? 'active' : ''}`} onClick={() => setActiveTab('repair')}>Repair Entry Review</button>
            <button className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
            <button className={`sidebar-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>View Pending Requests</button>
            <button className={`sidebar-btn ${activeTab === 'vehicle' ? 'active' : ''}`} onClick={() => setActiveTab('vehicle')}>Vehicle Details</button>
            <button className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users Details</button>
            <button className={`sidebar-btn ${activeTab === 'escertif' ? 'active' : ''}`} onClick={() => setActiveTab('escertif')}>Essentiality Certificate</button>
            <button className={`sidebar-btn ${activeTab === 'techcert' ? 'active' : ''}`} onClick={() => setActiveTab('techcert')}>Technical Certificate</button>
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

                <button onClick={handleEditToggle} className="edit-btn">
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
                </div>
                <div className="upload-section">
                  <img src={repairData.signature || 'https://via.placeholder.com/100'} alt="Signature" className="upload-icon" />
                  <p>Signature</p>
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
            <div style={{ padding: '20px' }}>
              <EssentialityCertificate />
            </div>
          )}
          {activeTab === 'techcert' && (
            <div style={{ padding: '20px' }}>
              <TechnicalCertificate />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RepairDashboard;
