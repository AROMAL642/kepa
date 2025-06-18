import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

import LoginPage from './LoginPage';
import RepairDashboard from './RepairSectionDashboard';
import RegisterPage from './RegisterPage';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import ViewRequests from './ViewRequests';
import AddRemoveVehicleForm from './admindashboardcomponents/AddRemoveVehicleForm';
import SearchVehicleDetails from './userdashboardcomponents/SearchVehicleDetails';
import RepairRequestForm from './userdashboardcomponents/RepairRequestForm';
import FuelSectionDashboard from './FuelSectionDashboard';
import FuelAdmin2 from './admindashboardcomponents/FuelAdmin2';
import MechanicDashboard from './MechanicDashboard';
import ResetPassword from './ResetPassword';
import NotFound from './404';

import './App.css';

function AppWrapper() {
  const location = useLocation();

  // List of paths where header should be hidden (dashboard pages)
  const hideHeaderPaths = [
    '/admin', '/user', '/fuel', '/mechanic',
    '/viewrequests', '/userdetails', '/admin/vehicles',
    '/searchvehicle', '/repair-request','/repair'
  ];

  // Check if current path matches any of the above (partial match)
  const hideHeader = hideHeaderPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="App">
      {!hideHeader && (
        <header className="App-header">
          <img className="App-logo" src="/images/kepa_logo.png" alt="Logo" />
          <h1>Kerala Police Academy</h1>
          <h3>Motor Transport Wing</h3>
        </header>
      )}

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={localStorage.getItem('adminData') ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/viewrequests" element={<ViewRequests themeStyle={{ background: 'black', color: 'white' }} />} />
        
        <Route path="/admin/vehicles" element={<AddRemoveVehicleForm />} />
        <Route path="/searchvehicle" element={<SearchVehicleDetails />} />
        <Route path="/repair-request" element={<RepairRequestForm />} />
        <Route path="/fuel" element={<FuelSectionDashboard />} />
        <Route path="/mechanic" element={<MechanicDashboard />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/fuel-admin2" element={<FuelAdmin2 />} />
        <Route path="/repair" element={<RepairDashboard />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;