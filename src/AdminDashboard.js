import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

function AdminDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [vehicleTab, setVehicleTab] = useState('main');
  const [pendingCount, setPendingCount] = useState(0);
  const [loadingVerifiedUsers, setLoadingVerifiedUsers] = useState(false);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state for Skeleton
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    pen: '',
    photo: '',
    signature: '',
  });

  useEffect(() => {
    // Show skeleton for 2 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setAdminData({
      name: localStorage.getItem('adminName') || '',
      email: localStorage.getItem('adminEmail') || '',
      pen: localStorage.getItem('adminPen') || '',
      photo: localStorage.getItem('adminPhoto') || '',
      signature: localStorage.getItem('adminSignature') || ''
    });
    fetchPendingCount();
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/adminlogin');
  };

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
      <ResponsiveAppBar photo={adminData.photo} name={adminData.name} />

      <button className="drawer-toggle-btn" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
        ☰
      </button>

      <div className={`dashboard ${isDrawerOpen ? 'drawer-open' : ''}`} style={themeStyle}>
        {/* Sidebar Drawer */}
        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
          <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          <h2>ADMIN PANEL</h2>

          <div className="sidebar-buttons">
            <button className="sidebar-btn" onClick={() => setActiveTab('profile')}>Profile</button>
            <button className="sidebar-btn" onClick={() => setActiveTab('Fuel')}>Fuel</button>
            <button className="sidebar-btn" onClick={() => setActiveTab('Movement')}>Movement Register</button>
            <button className="sidebar-btn" onClick={() => setActiveTab('Repair')}>Repair Reports</button>
            <button className="sidebar-btn" onClick={() => setActiveTab('Accident')}>Accident Details</button>
            <button className="sidebar-btn" onClick={() => { setActiveTab('VehicleDetails'); setVehicleTab('main'); }}>Vehicle</button>

            <button className="sidebar-btn notification-btn" onClick={() => setActiveTab('Request')}>
              Non Verified Users
              {pendingCount > 0 && <span className="notification-badge">{pendingCount}</span>}
            </button>

            <button className="sidebar-btn" onClick={() => setActiveTab('userdetails')}>Users Details</button>
          </div>

          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>

        {/* Main Content */}
        <div className="main-content" style={themeStyle}>
          {activeTab === 'profile' && (
            <div className="form-section">
              <div className="form-left">
                {['name', 'email', 'pen'].map((field) => (
                  <div className="form-group" key={field}>
                    <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input type="text" value={adminData[field]} readOnly style={themeStyle} />
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


          {activeTab === 'Fuel' && (
            <FuelAdmin themeStyle={themeStyle} />
          )}

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
              <button className="vehicle-btn" onClick={() => setVehicleTab('addremove')}>Add/Remove Vehicle</button>
              <button className="vehicle-btn" onClick={() => setVehicleTab('search')}>Search Vehicle Details</button>
              <button className="vehicle-btn">Expense Details</button>
              <button className="vehicle-btn">View/Print Registers</button>
              <button className="vehicle-btn" onClick={() => setVehicleTab('viewassign')}>View/Assign Vehicle</button>
            </div>
          )}

          {activeTab === 'VehicleDetails' && vehicleTab === 'addremove' && (
            <AddRemoveVehicleForm onBack={() => setVehicleTab('main')} themeStyle={themeStyle} />
          )}

          {activeTab === 'Request' && <ViewRequests themeStyle={themeStyle} />}

          {activeTab === 'VehicleDetails' && vehicleTab === 'search' && (
            <SearchVehicleDetails onBack={() => setVehicleTab('main')} themeStyle={themeStyle} />
          )}

          {activeTab === 'VehicleDetails' && vehicleTab === 'viewassign' && (
            <ViewAssignVehicle onBack={() => setVehicleTab('main')} themeStyle={themeStyle} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;