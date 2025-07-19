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
import RegisterPage from './admindashboardcomponents/RegisterPage';
import AdminRepairTable from './admindashboardcomponents/AdminRepairTable';
import ViewPrintRegisters from './admindashboardcomponents/ViewPrintRegisters';
import AddUpdateCertificate from './admindashboardcomponents/AddUpdateCertificate';
import AdminStocksView from './admindashboardcomponents/AdminStocksView';
import Purchase from './mechanicdashboardcomponents/Purchase';
import Expense from './admindashboardcomponents/Expense'; 
import TraineesDetails from './admindashboardcomponents/TraineesDetails';
import NotificationPage from './admindashboardcomponents/NotificationPage';
import Dashboard from './admindashboardcomponents/Dashboard';


// MUI Icons
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PrintIcon from '@mui/icons-material/Print';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DashboardIcon from '@mui/icons-material/Dashboard';




import dayjs from 'dayjs';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicleTab, setVehicleTab] = useState('main');
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingFuelCount, setPendingFuelCount] = useState(0);
  const [pendingAccidentCount, setPendingAccidentCount] = useState(0);
  const [repairPendingCount, setRepairPendingCount] = useState(0);
  const [expiredCertCount, setExpiredCertCount] = useState(0);
  const [repairCombinedCount, setRepairCombinedCount] = useState(0);

  
  const totalNotifications = pendingCount + pendingFuelCount + pendingAccidentCount + repairPendingCount;
  


  const [loadingVerifiedUsers, setLoadingVerifiedUsers] = useState(false);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  const [newPhoto, setNewPhoto] = useState(null);
  const [newSignature, setNewSignature] = useState(null);
  const MAX_IMAGE_SIZE = 100 * 1024;

  const [adminData, setAdminData] = useState({
    name: '', email: '', pen: '', generalNo: '', photo: '',
    signature: '', role: '', phone: '', dob: '',
    licenseNo: '', bloodGroup: '', gender: ''
  });

  const fieldLabels = {
    name: 'Name', email: 'Email', pen: 'PEN', generalNo: 'General No',
    phone: 'Mobile', dob: 'Date of Birth', licenseNo: 'License Number',
    bloodGroup: 'Blood Group', gender: 'Gender', role: 'Role'
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    const storedAdminData = localStorage.getItem('adminData');
    if (storedAdminData) {
      const parsedData = JSON.parse(storedAdminData);
      setAdminData(parsedData);
      setEditedProfile(parsedData);
    }
    fetchPendingCount();
    fetchPendingFuelCount();
    fetchPendingAccidentCount();
    fetchRepairPendingCount();
    fetchExpiredCertCount();
    fetchRepairCombinedCount(); // fetch the new combined count

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

  const fetchPendingAccidentCount = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/accident-pending-count');
    const data = await res.json();
    setPendingAccidentCount(data.count || 0);
  } catch (error) {
    console.error('Error fetching pending accident count:', error);
  }
};

const fetchRepairPendingCount = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/repair/pending/count');
    const data = await res.json();
    setRepairPendingCount(data.count || 0);
  } catch (error) {
    console.error('Error fetching repair pending count:', error);
  }
};


  const fetchPendingFuelCount = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/fuel-pending-count');
      const data = await res.json();
      setPendingFuelCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching fuel pending count:', error);
    }
  };

 const fetchExpiredCertCount = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/expired-count'); // ✅ changed route
    const data = await res.json();
    setExpiredCertCount(data.count || 0); // ✅ get `count`
  } catch (error) {
    console.error('Error fetching expired certificate count:', error);
  }
};

const fetchRepairCombinedCount = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/repair/pending/sumcount');
    const data = await res.json();
    setRepairCombinedCount(data.count || 0);
  } catch (error) {
    console.error('Error fetching repair combined count:', error);
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

const handleFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result;
      resolve(base64String); // ✅ includes 'data:image/png;base64,...'
    };
    reader.onerror = reject;
    reader.readAsDataURL(file); // ✅ IMPORTANT: must use readAsDataURL, not readAsBinaryString
  });
};


const handleSaveProfile = async () => {
  try {
    const formData = new FormData();
    formData.append('pen', adminData.pen);

    // Append editable text fields
    ['name', 'email', 'phone', 'licenseNo', 'dob'].forEach(key => {
      if (editedProfile[key]) {
        formData.append(key, editedProfile[key]);
      }
    });

    // Append image files
    if (newPhoto) {
      formData.append('photo', newPhoto);
    }

    if (newSignature) {
      formData.append('signature', newSignature);
    }

    const response = await fetch('http://localhost:5000/api/update-admin', {
      method: 'PUT',
      body: formData // ✅ send as FormData
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('adminData', JSON.stringify(data));
      setAdminData(data);
      setEditedProfile(data);
      setIsEditing(false);
      setNewPhoto(null);
      setNewSignature(null);
      alert('Profile updated successfully');
    } else {
      alert(data.error || 'Update failed');
    }
  } catch (err) {
    console.error('Error updating admin profile:', err);
    alert('Error while updating profile');
  }
};



 const handleTabSelect = (tab) => {
  if (tab === 'notificationsPage') {
    setActiveTab('notificationsPage');
  } else {
    setActiveTab(tab);
  }
};


  const themeStyle = {
    background: '#fff',
    color: '#000',
    borderColor: '#ccc',
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
      <ResponsiveAppBar
        photo={adminData.photo}
        name={adminData.name}
        isDrawerOpen={isDrawerOpen}
        onDrawerToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        onSelectTab={handleTabSelect}
        pendingRequestCount={totalNotifications}
        expiredCertCount={expiredCertCount}
      />

      <button className="drawer-toggle-btn" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>☰</button>

      <div className={`dashboard ${isDrawerOpen ? 'drawer-open' : ''}`} style={themeStyle}>
        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
          <h2>ADMIN PANEL</h2>
          {adminData.role && (
            <div className="role-badge" style={{
              background: '#4CAF50', color: 'white', padding: '5px 10px',
              borderRadius: '20px', marginBottom: '15px', fontSize: '0.9rem'
            }}>
              {adminData.role}
            </div>
          )}
          
          <div className="sidebar-buttons">
            <button className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
           <DashboardIcon style={{ marginRight: '8px' }} /> Dashboard
            </button>


            <button className={`sidebar-btn notification-btn ${activeTab === 'Fuel' ? 'active' : ''}`} onClick={() => setActiveTab('Fuel')}>
              <LocalGasStationIcon style={{ marginRight: '8px' }} /> Fuel {pendingFuelCount > 0 && <span className="notification-badge">{pendingFuelCount}</span>}
            </button>

            <button className={`sidebar-btn ${activeTab === 'Movement' ? 'active' : ''}`} onClick={() => setActiveTab('Movement')}>
              <DirectionsCarIcon style={{ marginRight: '8px' }} /> Movement Register
            </button>

            <button
  className={`sidebar-btn notification-btn ${activeTab === 'Repair' ? 'active' : ''}`}
  onClick={() => setActiveTab('Repair')}
>
  <BuildIcon style={{ marginRight: '8px' }} /> Repair Reports
  {repairCombinedCount > 0 && (
    <span className="notification-badge">{repairCombinedCount}</span>
  )}
</button>



            <button className={`sidebar-btn notification-btn ${activeTab === 'Accident' ? 'active' : ''}`} onClick={() => setActiveTab('Accident')}>
              <ReportProblemIcon style={{ marginRight: '8px' }} /> Accident Details {pendingAccidentCount > 0 && <span className="notification-badge">{pendingAccidentCount}</span>}
            </button>

            <button className={`sidebar-btn ${activeTab === 'VehicleDetails' ? 'active' : ''}`} onClick={() => { setActiveTab('VehicleDetails'); setVehicleTab('main'); }}>
              <DirectionsCarIcon style={{ marginRight: '8px' }} /> Vehicle
            </button>

            <button className={`sidebar-btn notification-btn ${activeTab === 'Request' ? 'active' : ''}`} onClick={() => setActiveTab('Request')}>
              <PersonSearchIcon style={{ marginRight: '8px' }} /> Non Verified Users {pendingCount > 0 && <span className="notification-badge">{pendingCount}</span>}
            </button>

            <button className={`sidebar-btn ${activeTab === 'stocks' ? 'active' : ''}`} onClick={() => setActiveTab('stocks')}>
              <InventoryIcon style={{ marginRight: '8px' }} /> unservisable Stock
            </button>

            <button className={`sidebar-btn ${activeTab === 'VerifiedUsersTable' ? 'active' : ''}`} onClick={() => setActiveTab('VerifiedUsersTable')}>
              <PeopleIcon style={{ marginRight: '8px' }} /> Users Details
            </button>

            <button className={`sidebar-btn ${activeTab === 'AddUser' ? 'active' : ''}`} onClick={() => setActiveTab('AddUser')}>
              <AddCircleOutlineIcon style={{ marginRight: '8px' }} /> Add Users
            </button>

            <button className={`sidebar-btn ${activeTab === 'PrintRegisters' ? 'active' : ''}`} onClick={() => setActiveTab('PrintRegisters')}>
              <PrintIcon style={{ marginRight: '8px' }} /> View/Print Registers
            </button>
            <button className={`sidebar-btn ${activeTab === 'repairStock' ? 'active' : ''}`} onClick={() => setActiveTab('repairStock')}>
               <InventoryIcon style={{ marginRight: '8px' }} /> Repair Stock                      
            </button>


            <button className={`sidebar-btn ${activeTab === 'trainees' ? 'active' : ''}`} onClick={() => setActiveTab('trainees')}>
              <SchoolIcon style={{ marginRight: '8px' }} /> Trainees Details
            </button>

            <button className={`sidebar-btn ${activeTab === 'Purchases' ? 'active' : ''}`} onClick={() => setActiveTab('Purchases')}>
              <ShoppingCartIcon style={{ marginRight: '8px' }} /> Purchase
            </button>
          </div>
        </div>

        <div className="main-content" style={themeStyle}>
          {activeTab === 'profile' && (
            <div className="form-section">
              <div className="form-left">
                {Object.entries(fieldLabels).map(([key, label]) => (
                  <div className="form-group" key={key}>
                    <label>{label}</label>
                    {key === 'dob' && isEditing ? (
                      <input
                        type="date"
                        value={editedProfile.dob ? dayjs(editedProfile.dob).format('YYYY-MM-DD') : ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, dob: e.target.value }))}
                        style={themeStyle}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          isEditing
                            ? editedProfile[key] || ''
                            : key === 'dob' && adminData.dob
                              ? dayjs(adminData.dob).format('DD-MM-YYYY')
                              : adminData[key] || ''
                        }
                        readOnly={!isEditing || ['pen', 'generalNo', 'role', 'gender', 'bloodGroup'].includes(key)}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, [key]: e.target.value }))}
                        style={themeStyle}
                        className={key === 'role' ? 'role-field' : ''}
                      />
                    )}
                  </div>
                ))}
                <div style={{ marginTop: '15px' }}>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="submit-btn">Edit Profile</button>
                  ) : (
                    <>
                      <button onClick={handleSaveProfile} className="save-btn">Save Changes</button>
                      <button onClick={() => { setIsEditing(false); setEditedProfile(adminData); }} className="cancel-btn">Cancel</button>
                    </>
                  )}
                </div>
              </div>
              <div className="form-right">


  <div className="upload-section">
  <img
    src={
      editedProfile.photo ||
      adminData.photo ||
      'https://via.placeholder.com/100'
    }
    alt="Profile Preview"
    className="upload-icon"
  />
  <p>Profile Photo</p>
  {isEditing && (
    <input
      type="file"
      accept="image/*"
      onChange={async (e) => {
        const file = e.target.files[0];
        if (file) {
          const maxSize = 100 * 1024; // 100 KB
          if (file.size > maxSize) {
            alert('Photo must be less than 100 KB');
            return;
          }

          const base64 = await handleFileToBase64(file);
          setNewPhoto(file);
          setEditedProfile((prev) => ({ ...prev, photo: base64 }));
        }
      }}
    />
  )}
</div>

<div className="upload-section">
  <img
    src={
      editedProfile.signature ||
      adminData.signature ||
      'https://via.placeholder.com/100'
    }
    alt="Signature Preview"
    className="upload-icon"
  />
  <p>Signature</p>
  {isEditing && (
    <input
      type="file"
      accept="image/*"
      onChange={async (e) => {
        const file = e.target.files[0];
        if (file) {
          const maxSize = 100 * 1024; // 100 KB
          if (file.size > maxSize) {
            alert('Signature must be less than 100 KB');
            return;
          }

          const base64 = await handleFileToBase64(file);
          setNewSignature(file);
          setEditedProfile((prev) => ({ ...prev, signature: base64 }));
        }
      }}
    />
  )}
</div>

</div>

            </div>
          )}
          {activeTab === 'dashboard' && (
  <Dashboard
    onSelectTab={setActiveTab}
    pendingFuelCount={pendingFuelCount}
    repairPendingCount={repairPendingCount}
    pendingAccidentCount={pendingAccidentCount}
    pendingCount={pendingCount}
    expiredCertCount={expiredCertCount}
  />
)}

          {activeTab === 'Fuel' && <FuelAdmin themeStyle={themeStyle} />}

          {activeTab === 'repairStock' && (
  <div style={{ padding: '20px' }}>
    <h2>Repair Stock Management</h2>
    <p>This section will handle repair-related stock (replace with real component).</p>
  </div>
)}


          {activeTab === 'VerifiedUsersTable' && <VerifiedUsersTable themeStyle={themeStyle} />}
          {activeTab === 'userdetails' && (
            <div>
              <h2>Verified Users</h2>
              {loadingVerifiedUsers ? (
                <div className="loading-spinner">Loading users...</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>PEN</th><th>General No</th><th>Mobile Number</th><th>Action</th></tr>
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
                      <tr><td colSpan="5">No verified users found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {activeTab === 'VehicleDetails' && vehicleTab === 'main' && (
            <div className="vehicle-box">
              <button className="vehicle-btn" onClick={() => setVehicleTab('addremove')}>Add Vehicle</button>
              <button className="vehicle-btn" onClick={() => setVehicleTab('search')}>Search Vehicle Details</button>
              <button className="vehicle-btn" onClick={() => setVehicleTab('expense')}>Expense Details</button>

              <button className="vehicle-btn" onClick={() => setVehicleTab('viewassign')}>View/Assign Vehicle</button>
              <button className="vehicle-btn" onClick={() => setVehicleTab('certificate')}>View and Update Certificates</button>
            </div>
          )}
          {activeTab === 'VehicleDetails' && vehicleTab === 'addremove' && <AddRemoveVehicleForm onBack={() => setVehicleTab('main')} themeStyle={themeStyle} />}
          {activeTab === 'VehicleDetails' && vehicleTab === 'search' && <SearchVehicleDetails onBack={() => setVehicleTab('main')} themeStyle={themeStyle} />}
          {activeTab === 'VehicleDetails' && vehicleTab === 'viewassign' && <ViewAssignVehicle onBack={() => setVehicleTab('main')} themeStyle={themeStyle} />}
          {activeTab === 'VehicleDetails' && vehicleTab === 'certificate' && <AddUpdateCertificate onBack={() => setVehicleTab('main')} themeStyle={themeStyle} />}
          {activeTab === 'VehicleDetails' && vehicleTab === 'expense' && <Expense onBack={() => setVehicleTab('main')} themeStyle={themeStyle} />}

          {activeTab === 'Request' && <ViewRequests themeStyle={themeStyle} />}
          {activeTab === 'Movement' && <MovementAdmin themeStyle={themeStyle} />}
          {activeTab === 'Accident' && <AccidentReportTable themeStyle={themeStyle} />}
          {activeTab === 'Repair' && (
  <AdminRepairTable
    themeStyle={themeStyle}
    onCountsUpdate={(counts) => {
      // Add individual counts if available, fallback to 0
      const total =
        (counts.repair || 0) + (counts.mechanic || 0) + (counts.certificate || 0);
      setRepairCombinedCount(total);
    }}
  />
)}

          {activeTab === 'AddUser' && <RegisterPage themeStyle={themeStyle} />}
          {activeTab === 'PrintRegisters' && <ViewPrintRegisters />}
          {activeTab === 'stocks' && <AdminStocksView />}
          {activeTab === 'trainees' && <TraineesDetails themeStyle={themeStyle} />}
          {activeTab === 'notificationsPage' && <NotificationPage themeStyle={themeStyle} />}



          {activeTab === 'Purchases' && <Purchase isAdmin={true} themeStyle={themeStyle} />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
