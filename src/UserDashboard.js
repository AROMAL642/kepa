import React, { useState, useEffect } from 'react';
import './css/userdashboard.css';
import MovementRegister from './userdashboardcomponents/MovementRegister';
import SearchVehicleDetails from './userdashboardcomponents/SearchVehicleDetails';
import { useNavigate } from 'react-router-dom';
import './css/movement.css';
import './css/SearchVehicleDetails.css';
import FuelRegister from './userdashboardcomponents/FuelRegister';
import RepairRequestForm from './userdashboardcomponents/RepairRequestForm';
import AccidentReportForm from './userdashboardcomponents/AccidentReportForm';
import './css/accidentreportform.css';
import EyeTestReport from './userdashboardcomponents/EyeTestReport';
import ResponsiveAppBar from './userdashboardcomponents/ResponsiveAppBar';
import TrackRepairRequests from './userdashboardcomponents/trackrepairrequest';
import AddUpdateCertificate from './admindashboardcomponents/AddUpdateCertificate'; 
import LicenseForm from './userdashboardcomponents/LicenseForm';
import NotificationPage from './userdashboardcomponents/NotificationPage';



// ✅ New Imports
import Stocks from './mechanicdashboardcomponents/Stocks';
import ViewAllStocks from './mechanicdashboardcomponents/ViewAllStocks';

function UserDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [assignedVehicle, setAssignedVehicle] = useState('');


  const [formData, setFormData] = useState({
    name: '',
    pen: '',
    generalNo: '',
    email: '',
    mobile: '',
    dob: '',
    licenseNo: '',
    bloodGroup: '',
    gender: '',
    role: '',
    profilePic: '',
    signature: '',
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const formattedDOB = user.dob ? user.dob.split('T')[0] : '';
      setFormData({
        name: user.name,
        pen: user.pen,
        generalNo: user.generalNo,
        email: user.email,
        mobile: user.phone,
        dob: formattedDOB,
        licenseNo: user.licenseNo,
        bloodGroup: user.bloodGroup,
        gender: user.gender,
        profilePic: user.photo,
        signature: user.signature,
        role: user.role || 'user',
      });
    }

    if (user?.pen) {
  fetch(`http://localhost:5000/api/vehicles/assigned/${user.pen}`)
    .then(res => res.json())
    .then(data => {
      if (data.vehicleNumber) {
        setAssignedVehicle(data.vehicleNumber);
      }
    })
    .catch(err => console.error('Failed to fetch assigned vehicle', err));
}

  }, []);

  useEffect(() => {
    const handleTabSwitch = (e) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('switchTab', handleTabSwitch);
    return () => window.removeEventListener('switchTab', handleTabSwitch);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const tabMap = [
    { key: 'profile', label: 'Profile' },
    { key: 'fuel', label: 'Fuel' },
    { key: 'repair', label: 'Request for Repair' },
    { key: 'trackrepair', label: 'Track Repair Requests' },
    { key: 'movement', label: 'Movement' },
    { key: 'eyetest', label: 'Eye Test' },
    { key: 'license', label: 'License' },
    { key: 'accident', label: 'Accident' },
    { key: 'vehicle details', label: 'Vehicle Details' },
    { key: 'certificates', label: 'Vehicle Certificates' }, 
    { key: 'stocks', label: 'Stocks' },              
    { key: 'viewalltocks', label: 'View All Stock ' },   
    { key: 'notifications', label: 'Notifications' }
 
  ];

  return (
    <>
      <ResponsiveAppBar
        photo={formData.profilePic}
        name={formData.name}
        role={formData.role}
        isDrawerOpen={isDrawerOpen}
        onDrawerToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        onSelectTab={setActiveTab}
      />

      <button className="drawer-toggle-btn" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>☰</button>

      <div className={`dashboard ${isDrawerOpen ? 'drawer-open' : ''}`}>
        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
          <h2>Welcome {formData.name || 'User'}</h2>

            {assignedVehicle && (
  <p style={{ marginBottom: '1rem', color: '#333', fontWeight: 'bold' }}>
    Assigned Vehicle: {assignedVehicle}
  </p>
)}


          <div className="sidebar-buttons">
            {tabMap.map(({ key, label }) => (
              <button
                key={key}
                className={`sidebar-btn ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)} // ✅ Just switch tab
              >
                {label}
              </button>
            ))}
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>

        <div className="main-content">
          {activeTab === 'profile' && (
            <div className="form-section">
              <div className="form-left">
                {[
                  { label: 'Name', name: 'name' },
                  { label: 'PEN number', name: 'pen', readOnly: true },
                  { label: 'General Number', name: 'generalNo', readOnly: true },
                  { label: 'Email', name: 'email' },
                  { label: 'Mobile Number', name: 'mobile' },
                  { label: 'DOB', name: 'dob', type: 'date' },  // Editable DOB
                  { label: 'Licence Number', name: 'licenseNo' },
                  { label: 'Blood Group', name: 'bloodGroup', readOnly: true },
                  { label: 'Gender', name: 'gender', readOnly: true },
                ].map(field => (
                  <div className="form-group" key={field.name}>
                    <label>{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      name={field.name}
                      value={formData[field.name] || ''}
                      readOnly={field.readOnly || !editMode}
                      onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    />
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
                            body: JSON.stringify(formData),
                          });

                          const data = await response.json();
                          if (response.ok) {
                            alert('Profile updated successfully');
                            localStorage.setItem('user', JSON.stringify(data.updatedUser));
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
                    src={formData.profilePic || 'https://via.placeholder.com/100'}
                    alt="Profile"
                    className="upload-icon"
                  />
                  <p>Profile Photo</p>
                </div>
                <div className="upload-section">
                  <img
                    src={formData.signature || 'https://via.placeholder.com/100'}
                    alt="Signature"
                    className="upload-icon"
                  />
                  <p>Signature</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'movement' && (
            <div className="movement-section">
              <MovementRegister />
            </div>
          )}

          {activeTab === 'vehicle details' && (
            <div className="vehicle-details-section">
              <SearchVehicleDetails />
            </div>
          )}

          {activeTab === 'fuel' && (
            <FuelRegister pen={formData.pen} />
          )}

          {activeTab === 'repair' && (
            <div className="repair-request-section">
              <RepairRequestForm pen={formData.pen} />
            </div>
          )}
           {activeTab === 'trackrepair' && (
            <div className="trackrepair-section">
              <TrackRepairRequests />
            </div>
          )}

          {activeTab === 'accident' && (
            <div className="accident-section">
              <AccidentReportForm pen={formData.pen} />
            </div>
          )}

          {activeTab === 'eyetest' && (
            <div className="eyetest-section">
              <EyeTestReport pen={formData.pen} />
            </div>
          )}
          {activeTab === 'license' && (
  <div className="license-section">
    <LicenseForm pen={formData.pen} />
  </div>
)}

          {activeTab === 'stocks' && (
  <Stocks onViewAll={() => setActiveTab('viewallstocks')} />
)}

{activeTab === 'viewallstocks' && (
  <ViewAllStocks onBack={() => setActiveTab('stocks')} />

)}
{activeTab === 'certificates' && (
            <div className="certificates-section">
              <AddUpdateCertificate />
            </div>
          )}
          {activeTab === 'notifications' && (
  <div className="notification-section">
    <NotificationPage />
  </div>
)}


        </div>
      </div>
    </>
  );
}

export default UserDashboard;
