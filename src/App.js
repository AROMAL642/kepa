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
import Dashboard from './admindashboardcomponents/Dashboard';
import PrivateRoute from './components/PrivateRoute';

import './App.css';

function AppWrapper() {
  const location = useLocation();

  const hideHeaderPaths = [
    '/admin', '/mainadmin', '/user', '/fuel', '/mechanic',
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
          <h3>Motor Transport Management System</h3>
        </header>
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="MTI">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/mainadmin"
          element={
            <PrivateRoute role="admin">
              <MainAdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/user"
          element={
            <PrivateRoute role="user">
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/fuel"
          element={
            <PrivateRoute role="fuel">
              <FuelSectionDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/mechanic"
          element={
            <PrivateRoute role="mechanic">
              <MechanicDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/repair"
          element={
            <PrivateRoute role="repair">
              <RepairDashboard />
            </PrivateRoute>
          }
        />

        {/* Other Feature Pages (can be protected or left public as needed) */}
        <Route path="/fuel-admin2" element={<FuelAdmin2 />} />
        <Route path="/viewrequests" element={<ViewRequests />} />
        <Route path="/admin/vehicles" element={<AddRemoveVehicleForm />} />
        <Route path="/searchvehicle" element={<SearchVehicleDetails />} />
        <Route path="/repair-request" element={<RepairRequestForm />} />
        <Route path="/trackrepairrequest" element={<TrackRepairRequest />} />
        <Route path="/vehicle-certificates" element={<AddUpdateCertificate />} />
        <Route path="/admin/stocks" element={<Stocks />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* 404 Not Found */}
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
