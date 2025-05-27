import React, { useState, useEffect } from 'react';
import './css/admindashboard.css';

function AdminDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

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

  const themeStyle = {
    background: darkMode ? '#121212' : '#fff',
    color: darkMode ? '#f1f1f1' : '#57c7db',
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
          {/* Add more buttons here for other sections like Users, Reports, etc. */}
        </div>
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
      </div>
    </div>
  );
}

export default AdminDashboard;
