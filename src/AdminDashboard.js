import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 
import './css/admindashboard.css';

function AdminDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate(); // ✅ For redirecting after logout

  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    pen: '',
    photo: '',
    signature: '',
  });

  useEffect(() => {
    setAdminData({
      name: localStorage.getItem('adminName') || '',
      email: localStorage.getItem('adminEmail') || '',
      pen: localStorage.getItem('adminPen') || '',
      photo: localStorage.getItem('adminPhoto') || '',
      signature: localStorage.getItem('adminSignature') || ''
    });
  }, []);

  const handleLogout = () => {
    localStorage.clear();         
    navigate('/adminlogin');        
  };

  const themeStyle = {
    background: darkMode ? '#121212' : '#fff',
    color: darkMode ? '#f1f1f1' : '#000',
    borderColor: darkMode ? '#555' : '#ccc'
  };

  return (
    <div className="dashboard" style={themeStyle}>
      <div className="sidebar">
        <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>

        <h2>ADMIN PANEL</h2>

        <div className="sidebar-buttons">
          <button className="sidebar-btn" onClick={() => setActiveTab('profile')}>Profile</button>
          <button className="sidebar-btn" onClick={() => setActiveTab('Movement')}>Movement Register</button>
          <button className="sidebar-btn" onClick={() => setActiveTab('Repair')}>Repair Reports</button>
          <button className="sidebar-btn" onClick={() => setActiveTab('Accident')}>Accident Details</button>
          <button className="sidebar-btn" onClick={() => setActiveTab('VehicleDetails')}>Vehicle</button>
        </div>

        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </div>

      <div className="main-content" style={themeStyle}>
        {activeTab === 'profile' && (
          <div className="form-section">
            <div className="form-left">
              {[
                { label: 'Name', name: 'name' },
                { label: 'Email', name: 'email' },
                { label: 'PEN', name: 'pen' },
              ].map(field => (
                <div className="form-group" key={field.name}>
                  <label>{field.label}</label>
                  <input
                    type="text"
                    value={adminData[field.name] || ''}
                    readOnly
                    style={themeStyle}
                  />
                </div>
              ))}
            </div>

            <div className="form-right">
              <div className="upload-section">
                <img
                  src={adminData.photo || 'https://via.placeholder.com/100'}
                  alt="Profile"
                  className="upload-icon"
                />
                <p>Profile Photo</p>
              </div>
              <div className="upload-section">
                <img
                  src={adminData.signature || 'https://via.placeholder.com/100'}
                  alt="Signature"
                  className="upload-icon"
                />
                <p>Signature</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Movement' && (
          <div className="movement-section" style={{ width: '100%', maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '20px' }}>Search in Movement Register</h2>
            <div className="search-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Enter vehicle number or officer name"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '5px',
                  border: `1px solid ${themeStyle.borderColor}`,
                  background: themeStyle.background,
                  color: themeStyle.color
                }}
              />
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </div>
          </div>
        )}

        {activeTab === 'VehicleDetails' && (
          <div
            className="vehicle-box"
            style={{
              width: '400px',
              height: '600px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'top',
              justifyContent: 'left',
              gap: '20px'
            
            }}
          >
            <button className="vehicle-btn">Search Vehicle Details</button>
            <button className="vehicle-btn" onClick={() => navigate('/admin/vehicle')}>
            Add/Remove Vehicle
            </button>
            <button className="vehicle-btn">Expense Details</button>
            <button className="vehicle-btn">View/Print Registers</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
