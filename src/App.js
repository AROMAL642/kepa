import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ResetPassword from './ResetPassword';
import NotFound from './404';

import AdminDashboard from './AdminDashboard';
import MainAdminDashboard from './MainAdminDashboard';
import UserDashboard from './UserDashboard';
import MechanicDashboard from './MechanicDashboard';
import FuelSectionDashboard from './FuelSectionDashboard';
import FuelAdmin2 from './admindashboardcomponents/FuelAdmin2';
import RepairDashboard from './RepairSectionDashboard';

import ViewRequests from './ViewRequests';
import AddRemoveVehicleForm from './admindashboardcomponents/AddRemoveVehicleForm';
import SearchVehicleDetails from './userdashboardcomponents/SearchVehicleDetails';
import RepairRequestForm from './userdashboardcomponents/RepairRequestForm';

import Stocks from './mechanicdashboardcomponents/Stocks';
import TrackRepairRequest from './userdashboardcomponents/trackrepairrequest';
import AddUpdateCertificate from './admindashboardcomponents/AddUpdateCertificate';
import './App.css';

function AppWrapper() {
  const location = useLocation();

  const hideHeaderPaths = [
    '/admin','/mainadmin', '/user', '/fuel', '/mechanic',
    '/viewrequests', '/userdetails', '/admin/vehicles',
    '/searchvehicle', '/repair-request', '/repair'
  ];

  const hideHeader = hideHeaderPaths.some(path =>
    location.pathname.startsWith(path)
  );

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
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        {/* Dashboards */}
        <Route path="/admin" element={localStorage.getItem('adminData') ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/mainadmin" element={<MainAdminDashboard />} />
        <Route path="/mechanic" element={<MechanicDashboard />} />
        <Route path="/fuel" element={<FuelSectionDashboard />} />
        <Route path="/fuel-admin2" element={<FuelAdmin2 />} />
        <Route path="/repair" element={<RepairDashboard />} />

        {/* Feature Pages */}
        <Route path="/viewrequests" element={<ViewRequests themeStyle={{ background: 'black', color: 'white' }} />} />
        <Route path="/admin/vehicles" element={<AddRemoveVehicleForm />} />
        <Route path="/searchvehicle" element={<SearchVehicleDetails />} />
        <Route path="/repair-request" element={<RepairRequestForm />} />

       <Route path="/trackrepairrequest" element={<TrackRepairRequest />} />
        <Route path="/vehicle-certificates" element={<AddUpdateCertificate />} />

        {/* Stock Routes */}
        <Route path="/admin/stocks" element={<Stocks />} /> {/* ✅ FIXED: added route */}
        
        {/* 404 Fallback */}
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
