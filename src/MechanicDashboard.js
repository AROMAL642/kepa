import React, { useState, useEffect } from 'react';
import ResponsiveAppBar from './admindashboardcomponents/ResponsiveAppBar';
import SkeletonChildren from './admindashboardcomponents/SkeletonUI';
import SearchVehicleDetails from './repairsectiondashboardcomponents/SearchVehicleDetails';
import VerifiedUsersTable from './fuelsectiondashboardcomponents/VerifiedUsersTable';
import MechanicPendingRequests from './mechanicdashboardcomponents/MechanicPendingRequests';
import Stocks from './mechanicdashboardcomponents/Stocks'; // ✅ NEW IMPORT
import ViewAllStocks from './mechanicdashboardcomponents/ViewAllStocks';
import Purchase from './mechanicdashboardcomponents/Purchase';
 import './css/admindashboard.css';
import './css/fueladmin.css';


import BuildIcon from '@mui/icons-material/Build';
import PersonIcon from '@mui/icons-material/Person';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GroupIcon from '@mui/icons-material/Group';
import VerifiedIcon from '@mui/icons-material/Verified';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';





const MechanicEntryReview = () => <div style={{ padding: '20px' }}>Mechanic Entry Review Placeholder</div>;
const EssentialityCertificate = () => <div style={{ padding: '20px' }}>Essentiality Certificate Placeholder</div>;
const TechnicalCertificate = () => <div style={{ padding: '20px' }}>Technical Certificate Placeholder</div>;

function MechanicDashboard() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);


  const [mechanicData, setMechanicData] = useState({
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
    setMechanicData({
      name: localStorage.getItem('mechanicName') || '',
      email: localStorage.getItem('mechanicEmail') || '',
      pen: localStorage.getItem('mechanicPen') || '',
      phone: localStorage.getItem('mechanicPhone') || '',
      dob: (localStorage.getItem('mechanicDob') || '').substring(0, 10),
      licenseNo: localStorage.getItem('mechanicLicenseNo') || '',
      bloodGroup: localStorage.getItem('mechanicBloodGroup') || '',
      gender: localStorage.getItem('mechanicGender') || '',
      photo: localStorage.getItem('mechanicPhoto') || '',
      signature: localStorage.getItem('mechanicSignature') || '',
      role: localStorage.getItem('mechanicRole') || ''
    });
  }, []);

 useEffect(() => {
  const fetchPendingCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/repair/mechanicpending/count');
      const data = await response.json();
      if (response.ok) {
        setPendingCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  fetchPendingCount();
}, []);


  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setMechanicData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mechanicData),
      });

      const data = await response.json();
      if (response.ok) {
        const updated = data.updatedUser;

        Object.entries(updated).forEach(([key, value]) => {
          if (key === 'dob') {
            localStorage.setItem(`mechanic${capitalize(key)}`, (value || '').substring(0, 10));
          } else {
            localStorage.setItem(`mechanic${capitalize(key)}`, value || '');
          }
        });

        setMechanicData(prev => ({
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
        photo={mechanicData.photo}
        name={mechanicData.name}
        role={mechanicData.role}
        isDrawerOpen={isDrawerOpen}
        onDrawerToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        onSelectTab={setActiveTab}
      />

     <IconButton
  edge="start"
  color="inherit"
  aria-label="menu"
  onClick={() => setIsDrawerOpen(!isDrawerOpen)}
  sx={{ position: 'absolute', top: 10, left: 10, zIndex: 2000 }}
>
  <MenuIcon />
</IconButton>

      <div className={`dashboard ${isDrawerOpen ? 'drawer-open' : ''}`}>
        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
          <h2>MECHANIC SECTION</h2>
          {mechanicData.role && (
            <div className="role-badge" style={{
              background: '#3F51B5', color: 'white', padding: '5px 10px',
              borderRadius: '20px', marginBottom: '15px', fontSize: '0.9rem'
            }}>{mechanicData.role}</div>
          )}
          <div className="sidebar-buttons">
  <button className={`sidebar-btn ${activeTab === 'repair' ? 'active' : ''}`} onClick={() => setActiveTab('repair')}>
    <BuildIcon style={{ marginRight: '8px' }} /> Mechanic Entry Review
  </button>

  <button className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
    <PersonIcon style={{ marginRight: '8px' }} /> Profile
  </button>

  <button className={`sidebar-btn notification-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
    <PendingActionsIcon style={{ marginRight: '8px' }} />
    Pending Requests {pendingCount > 0 && <span className="notification-badge">{pendingCount}</span>}
  </button>

  <button className={`sidebar-btn ${activeTab === 'stocks' ? 'active' : ''}`} onClick={() => setActiveTab('stocks')}>
    <InventoryIcon style={{ marginRight: '8px' }} /> Stocks
  </button>

  <button className={`sidebar-btn ${activeTab === 'viewallstocks' ? 'active' : ''}`} onClick={() => setActiveTab('viewallstocks')}>
    <ListAltIcon style={{ marginRight: '8px' }} /> View All Stocks
  </button>

  <button className={`sidebar-btn ${activeTab === 'vehicle' ? 'active' : ''}`} onClick={() => setActiveTab('vehicle')}>
    <DirectionsCarIcon style={{ marginRight: '8px' }} /> Vehicle Details
  </button>

  <button className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
    <GroupIcon style={{ marginRight: '8px' }} /> Users Details
  </button>

  <button className={`sidebar-btn ${activeTab === 'escertif' ? 'active' : ''}`} onClick={() => setActiveTab('escertif')}>
    <VerifiedIcon style={{ marginRight: '8px' }} /> Essentiality Certificate
  </button>

  <button className={`sidebar-btn ${activeTab === 'techcert' ? 'active' : ''}`} onClick={() => setActiveTab('techcert')}>
    <EngineeringIcon style={{ marginRight: '8px' }} /> Technical Certificate
  </button>

  <button className={`sidebar-btn ${activeTab === 'purchase' ? 'active' : ''}`} onClick={() => setActiveTab('purchase')}>
    <ShoppingCartIcon style={{ marginRight: '8px' }} /> Purchase
  </button>
</div>

        </div>

        <div className="main-content">
          {activeTab === 'repair' && <MechanicEntryReview />}

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
                      value={mechanicData[name] || ''}
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
                  <img src={mechanicData.photo || 'https://via.placeholder.com/100'} alt="Profile" className="upload-icon" />
                  <p>Profile Photo</p>
                </div>
                <div className="upload-section">
                  <img src={mechanicData.signature || 'https://via.placeholder.com/100'} alt="Signature" className="upload-icon" />
                  <p>Signature</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div style={{ padding: '20px' }}>
              <h2>Pending Requests</h2>
              <MechanicPendingRequests />
            </div>
          )}

         {activeTab === 'stocks' && (
  <div style={{ padding: '20px' }}>
    <Stocks onViewAll={() => setActiveTab('viewallstocks')} />
  </div>
)}

{activeTab === 'viewallstocks' && (
  <div style={{ padding: '20px' }}>
    <ViewAllStocks onBack={() => setActiveTab('stocks')} />
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


          {activeTab === 'escertif' && <EssentialityCertificate />}
          {activeTab === 'techcert' && <TechnicalCertificate />}

          {activeTab === 'purchase' && (
            <div style={{ padding: '20px' }}>
            <Purchase />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default MechanicDashboard;
