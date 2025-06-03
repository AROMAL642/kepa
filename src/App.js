import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import ViewRequests from './ViewRequests';
import UserDetails from './UserDetails';
import AddRemoveVehicleForm from './AddRemoveVehicleForm';
import SearchVehicleDetails from './userdashboardcomponents/SearchVehicleDetails';
import './App.css';





function App() {
  return (
    <div className="App">
   
      <header className="App-header">
      <img className='App-logo' src="/images/kepa_logo.png" alt="Logo" />

      <h1>Kerala Police Academy</h1>
      <h3>Motor Transport Wing</h3>
      </header>

      <Router>
      <Routes>
        
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/viewrequests" element={<ViewRequests themeStyle={{ background: 'black', color: 'white' }} />} />
        <Route path="/userdetails/:id" element={<UserDetails />} />
        <Route path="/admin/vehicles" element={<AddRemoveVehicleForm />} />
        
        <Route path="/searchvehicle" element={<SearchVehicleDetails />} />
  
        <Route path="*" element={<Navigate to="/" />} />
    
    
      </Routes>
    </Router>





    </div>
  );
}

export default App;
