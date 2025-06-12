import React, { useState, useEffect } from 'react';

import ResponsiveAppBar from './admindashboardcomponents/ResponsiveAppBar';
import './css/admindashboard.css';
import AddRemoveVehicleForm from './admindashboardcomponents/AddRemoveVehicleForm';
import ViewRequests from './ViewRequests';
import SearchVehicleDetails from './admindashboardcomponents/SearchVehicleDetails';
import './css/SearchVehicleDetails.css';
import ViewAssignVehicle from './admindashboardcomponents/ViewAssignVehicle';
import './css/AssignVehicle.css';
import SkeletonChildren from './admindashboardcomponents/SkeletonUI'; 
import FuelAdmin from './admindashboardcomponents/FuelAdmin';
import './css/fueladmin.css';
import VerifiedUsersTable from './admindashboardcomponents/VerifiedUsersTable';
import './css/verifieduserstable.css';
import MovementAdmin from './admindashboardcomponents/MovementAdmin';
import AccidentReportTable from './admindashboardcomponents/AccidentReportTable';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [vehicleTab, setVehicleTab] = useState('main');
  const [pendingCount, setPendingCount] = useState(0);
  const [loadingVerifiedUsers, setLoadingVerifiedUsers] = useState(false);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    pen: '',
    generalNo: '',
    photo: '',
    signature: '',
    role: '',
    phone: '',
    dob: '',
    licenseNo: '',
    bloodGroup: '',
    gender: ''
  });

  const fieldLabels = {
    name: 'Name',
    email: 'Email',
    pen: 'PEN',
    generalNo: 'General No',
    phone: 'Mobile Number',
    dob: 'Date of Birth',
    licenseNo: 'License Number',
    bloodGroup: 'Blood Group',
    gender: 'Gender',
    role: 'Role'
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    const storedAdminData = localStorage.getItem('adminData');
    if (storedAdminData) {
      setAdminData(JSON.parse(storedAdminData));
    }
    fetchPendingCount();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeTab === 'userdetails') {
      fetchVerifiedUsers();
    }
  }, [activeTab]);

  const fetchPendingCount = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/unverified-users');
      const data = await res.json();
      setPendingCount(data.length);
    } catch (error) {
      console.error('Error fetching pending requests count:', error);
    }
  };

  const fetchVerifiedUsers = async () => {
    setLoadingVerifiedUsers(true);
    try {
      const res = await fetch('http://localhost:5000/api/verified-users');
      const data = await res.json();
      setVerifiedUsers(data);
    } catch (error) {
      console.error('Error fetching verified users:', error);
    } finally {
      setLoadingVerifiedUsers(false);
    }
  };

  const themeStyle = {
    background: '#fff',
    color: '#000',
    borderColor: '#ccc'
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
      <ResponsiveAppBar photo={adminData.photo} name={adminData.name} role={adminData.role} />

      <button className="drawer-toggle-btn" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
        ☰
      </button>

      <div className={`dashboard ${isDrawerOpen ? 'drawer-open' : ''}`} style={themeStyle}>
        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
          <h2>ADMIN PANEL</h2>
          {adminData.role && (
            <div className="role-badge" style={{ background: '#4CAF50', color: 'white', padding: '5px 10px', borderRadius: '20px', marginBottom: '15px', fontSize: '0.9rem' }}>
              {adminData.role}
            </div>
          )}

          <div className="sidebar-buttons">
            <button className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
            <button className={`sidebar-btn ${activeTab === 'Fuel' ? 'active' : ''}`} onClick={() => setActiveTab('Fuel')}>Fuel</button>
            <button className={`sidebar-btn ${activeTab === 'Movement' ? 'active' : ''}`} onClick={() => setActiveTab('Movement')}>Movement Register</button>
            <button className={`sidebar-btn ${activeTab === 'Repair' ? 'active' : ''}`} onClick={() => setActiveTab('Repair')}>Repair Reports</button>
            <button className={`sidebar-btn ${activeTab === 'Accident' ? 'active' : ''}`} onClick={() => setActiveTab('Accident')}>Accident Details</button>
            <button className={`sidebar-btn ${activeTab === 'VehicleDetails' ? 'active' : ''}`} onClick={() => { setActiveTab('VehicleDetails'); setVehicleTab('main'); }}>Vehicle</button>
            <button className={`sidebar-btn notification-btn ${activeTab === 'Request' ? 'active' : ''}`} onClick={() => setActiveTab('Request')}>
              Non Verified Users
              {pendingCount > 0 && <span className="notification-badge">{pendingCount}</span>}
            </button>
            <button className={`sidebar-btn ${activeTab === 'VerifiedUsersTable' ? 'active' : ''}`} onClick={() => setActiveTab('VerifiedUsersTable')}>Users Details</button>
          </div>
        </div>

        <div className="main-content" style={themeStyle}>
          {activeTab === 'profile' && (
            <div className="form-section">
              <div className="form-left">
                {Object.entries(fieldLabels).map(([key, label]) => (
                  <div className="form-group" key={key}>
                    <label>{label}</label>
                    <input
                      type="text"
                      value={adminData[key] || ''}
                      readOnly
                      style={themeStyle}
                      className={key === 'role' ? 'role-field' : ''}
                    />
                  </div>
                ))}
              </div>
              <div className="form-right">
                <div className="upload-section">
                  <img src={adminData.photo || 'https://via.placeholder.com/100'} alt="Profile" className="upload-icon" />
                  <p>Profile Photo</p>
                </div>
                <div className="upload-section">
                  <img src={adminData.signature || 'https://via.placeholder.com/100'} alt="Signature" className="upload-icon" />
                  <p>Signature</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Fuel' && <FuelAdmin themeStyle={themeStyle} />}
          {activeTab === 'VerifiedUsersTable' && <VerifiedUsersTable themeStyle={themeStyle} />}
          {activeTab === 'userdetails' && (
            <div>
              <h2 style={{ marginBottom: '10px' }}>Verified Users</h2>
              {loadingVerifiedUsers ? (
                <div className="loading-spinner">Loading users...</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>PEN</th>
                      <th>General No</th>
                      <th>Mobile Number</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifiedUsers.length > 0 ? (
                      verifiedUsers.map((user, index) => (
                        <tr key={index}>
                          <td>{user.name}</td>
                          <td>{user.pen}</td>
                          <td>{user.generalno}</td>
                          <td>{user.mobileno}</td>
                          <td><button>View Full Profile</button></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">No verified users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'VehicleDetails' && vehicleTab === 'main' && (
            <div className="vehicle-box" style={{ width: '400px', height: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <button className="vehicle-btn" onClick={() => setVehicleTab('addremove')}>Add Vehicle</button>
              <button className="vehicle-btn" onClick={() => setVehicleTab('search')}>Search Vehicle Details</button>
              <button className="vehicle-btn">Expense Details</button>
              <button className="vehicle-btn">View/Print Registers</button>
              <button className="vehicle-btn" onClick={() => setVehicleTab('viewassign')}>View/Assign Vehicle</button>
            </div>
          )}

          {activeTab === 'VehicleDetails' && vehicleTab === 'addremove' && <AddRemoveVehicleForm onBack={() => setVehicleTab('main')} themeStyle={themeStyle} />}
          {activeTab === 'Request' && <ViewRequests themeStyle={themeStyle} />}
          {activeTab === 'VehicleDetails' && vehicleTab === 'search' && <SearchVehicleDetails onBack={() => setVehicleTab('main')} themeStyle={themeStyle} />}
          {activeTab === 'VehicleDetails' && vehicleTab === 'viewassign' && <ViewAssignVehicle onBack={() => setVehicleTab('main')} themeStyle={themeStyle} />}
          {activeTab === 'Movement' && <MovementAdmin themeStyle={themeStyle} />}
          {activeTab === 'Accident' && <AccidentReportTable themeStyle={themeStyle} />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
