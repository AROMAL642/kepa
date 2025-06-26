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
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Stocks from './mechanicdashboardcomponents/Stocks';
import ViewAllStocks from './mechanicdashboardcomponents/ViewAllStocks';


import PersonIcon from '@mui/icons-material/Person';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BadgeIcon from '@mui/icons-material/Badge';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import InfoIcon from '@mui/icons-material/Info';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import InventoryIcon from '@mui/icons-material/Inventory';
import NotificationsIcon from '@mui/icons-material/Notifications';




function UserDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [assignedVehicle, setAssignedVehicle] = useState('');
  const [expiredCertCount, setExpiredCertCount] = useState(0);

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
  setFormData(prev => ({ ...prev, profilePic: base64 }));
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
  setFormData(prev => ({ ...prev, signature: base64 }));
  setNewSignatureFile(file);
};


useEffect(() => {
  fetch('http://localhost:5000/api/notifications/expired-count')
    .then(res => res.json())
    .then(data => setExpiredCertCount(data.count || 0))
    .catch(err => console.error('Error fetching expired count:', err));
}, []);



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
  { key: 'profile', label: 'Profile', icon: <PersonIcon /> },
  { key: 'fuel', label: 'Fuel', icon: <LocalGasStationIcon /> },
  { key: 'repair', label: 'Request for Repair', icon: <MiscellaneousServicesIcon /> },
  { key: 'trackrepair', label: 'Track Repair Requests', icon: <TrackChangesIcon /> },
  { key: 'movement', label: 'Movement', icon: <DirectionsRunIcon /> },
  { key: 'eyetest', label: 'Eye Test', icon: <VisibilityIcon /> },
  { key: 'license', label: 'License', icon: <BadgeIcon /> },
  { key: 'accident', label: 'Accident', icon: <ReportProblemIcon /> },
  { key: 'vehicle details', label: 'Vehicle Details', icon: <InfoIcon /> },
  { key: 'certificates', label: 'Vehicle Certificates', icon: <VerifiedUserIcon /> },
  { key: 'stocks', label: 'Stocks', icon: <InventoryIcon /> },
  { key: 'viewallstocks', label: 'View All Stock', icon: <InventoryIcon /> },
  { key: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
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
        expiredCertCount={expiredCertCount}
      />

      <button className="drawer-toggle-btn" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>☰</button>

      <div className={`dashboard ${isDrawerOpen ? 'drawer-open' : ''}`}>
        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
          <h2>Welcome {formData.name || 'User'}</h2>

           

{assignedVehicle && (
  <div
    style={{
      marginBottom: '1rem',
      color: '#1e88e5',
      fontWeight: '600',
      fontSize: '1.1rem',
      backgroundColor: '#e3f2fd',
      padding: '12px 16px',
      borderRadius: '6px',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      flexDirection: 'row'
    }}
  >
    <DirectionsCarIcon style={{ color: '#1e88e5', marginTop: '2px' }} />
    <div>
      <div style={{ fontWeight: 'bold' }}>Assigned Vehicle:</div>
      <div style={{ marginLeft: '10px', fontSize: '1rem', fontWeight: '500' }}>
        {assignedVehicle}
      </div>
    </div>
  </div>
)}


         <div className="sidebar-buttons">
  {tabMap.map(({ key, label, icon }) => (
    <button
      key={key}
      className={`sidebar-btn ${activeTab === key ? 'active' : ''}`}
      onClick={() => setActiveTab(key)}
    >
      <span className="icon-label-wrapper">
        {icon}
        <span className="label-text">{label}</span>
      </span>
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
      const formDataObj = new FormData();
      formDataObj.append('pen', formData.pen);
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('phone', formData.mobile);
      formDataObj.append('dob', formData.dob);
      formDataObj.append('licenseNo', formData.licenseNo);

      // Handle photo
      if (newPhotoFile) {
        formDataObj.append('photo', newPhotoFile);
      } else if (formData.profilePic) {
        formDataObj.append('photo', formData.profilePic);
      }

      // Handle signature
      if (newSignatureFile) {
        formDataObj.append('signature', newSignatureFile);
      } else if (formData.signature) {
        formDataObj.append('signature', formData.signature);
      }

      const response = await fetch('http://localhost:5000/api/users/update-admin', {
        method: 'PUT',
        body: formDataObj
      });

      const result = await response.json();

      if (response.ok) {
        alert('Profile updated successfully');
        localStorage.setItem('user', JSON.stringify(result));
        setEditMode(false);
      } else {
        alert(result.message || 'Update failed');
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
      src={formData.signature || 'https://via.placeholder.com/100'}
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
