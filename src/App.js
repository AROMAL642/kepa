import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import ViewRequests from './ViewRequests';
import UserDetails from './UserDetails';
import AddRemoveVehicleForm from './admindashboardcomponents/AddRemoveVehicleForm';
import SearchVehicleDetails from './userdashboardcomponents/SearchVehicleDetails';
import RepairRequestForm from './userdashboardcomponents/RepairRequestForm';
import FuelSectionDashboard from './FuelSectionDashboard';
import MechanicDashboard from './MechanicDashboard';


import './App.css';
import NotFound from './404';



function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img className="App-logo" src="/images/kepa_logo.png" alt="Logo" />
        <h1>Kerala Police Academy</h1>
        <h3>Motor Transport Wing</h3>
      </header>

      <Router>
  <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/admin"
            element={
              localStorage.getItem('adminData') ? <AdminDashboard /> : <Navigate to="/" />
            }
          />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/viewrequests" element={<ViewRequests themeStyle={{ background: 'black', color: 'white' }} />} />
          <Route path="/userdetails/:id" element={<UserDetails />} />
          <Route path="/admin/vehicles" element={<AddRemoveVehicleForm />} />
          <Route path="/searchvehicle" element={<SearchVehicleDetails />} />
          <Route path="/repair-request" element={<RepairRequestForm />} />
          <Route path="/fuel" element={<FuelSectionDashboard />} />
          <Route path="/mechanic" element={<MechanicDashboard />} />


          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
