import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import Requests from './Requests';
import './App.css';


function App() {
  return (
    <div className="App">
   
      <header className="App-header">
      <img src="/images/kepa_logo.png" alt="Logo" />

      <h1>Kerala Police Academy</h1>
      <h3>Motor Transport Wing</h3>
      </header>

      <Router>
      <Routes>
        
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="*" element={<Navigate to="/" />} />
    
    
      </Routes>
    </Router>





    </div>
  );
}

export default App;
