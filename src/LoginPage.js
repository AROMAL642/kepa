import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/loginform.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [pen, setPen] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/login', { pen, password });

      if (res.data.role === 'admin') {
        localStorage.setItem('adminPen', res.data.pen);
        localStorage.setItem('adminEmail', res.data.email);
        localStorage.setItem('adminName', res.data.name);
        localStorage.setItem('adminPhone', res.data.phone);
        localStorage.setItem('adminDob', res.data.dob);
        localStorage.setItem('adminLicenseNo', res.data.licenseNo);
        localStorage.setItem('adminBloodGroup', res.data.bloodGroup);
        localStorage.setItem('adminGender', res.data.gender);
        localStorage.setItem('adminPhoto', res.data.photo);
        localStorage.setItem('adminSignature', res.data.signature);
        navigate('/admin');
      } else if (res.data.role === 'mtiadmin') {
     localStorage.setItem('mtiAdminPen', res.data.pen);
        localStorage.setItem('mtiAdminEmail', res.data.email);
        localStorage.setItem('mtiAdminName', res.data.name);
        localStorage.setItem('mtiAdminPhone', res.data.phone);
        localStorage.setItem('mtiAdminDob', res.data.dob);
        localStorage.setItem('mtiAdminLicenseNo', res.data.licenseNo);
        localStorage.setItem('mtiAdminBloodGroup', res.data.bloodGroup);
        localStorage.setItem('mtiAdminGender', res.data.gender);
        localStorage.setItem('mtiAdminPhoto', res.data.photo);
        localStorage.setItem('mtiAdminSignature', res.data.signature);
      navigate('/mtiadmin');
      
      } else if (res.data.role === 'user') {
        localStorage.setItem('userPen', res.data.pen);
        localStorage.setItem('userGeneralNo', res.data.generalNo);
        localStorage.setItem('userEmail', res.data.email);
        localStorage.setItem('userName', res.data.name);
        localStorage.setItem('userphone', res.data.phone);
        localStorage.setItem('userdob', res.data.dob);
        localStorage.setItem('userlicenseNo', res.data.licenseNo);
        localStorage.setItem('userbloodGroup', res.data.bloodGroup);
        localStorage.setItem('usergender', res.data.gender);
        localStorage.setItem('userPhoto', res.data.photo);
        localStorage.setItem('userSignature', res.data.signature);
        navigate('/user');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Network or server error';
      alert('Login failed: ' + msg);
    }
  };

  return (
    <div className="containerStyle">
      <h2 className="headingStyle">Login</h2>
      <form onSubmit={handleLogin} className="formStyle">
        <div className="fieldStyle">
          <label htmlFor="pen">PEN Number</label>
          <input
            type="text"
            id="pen"
            value={pen}
            onChange={(e) => setPen(e.target.value)}
            required
            className="inputStyle"
            placeholder="Enter your PEN number"
          />
        </div>
        <div className="fieldStyle">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="inputStyle"
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="buttonStyle">
          Login
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <p>
          New user?{' '}
          <span
            onClick={() => navigate('/register')}
            style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Register here
          </span>
        </p>
        <p>
          <span
            onClick={() => navigate('/forgot-password')}
            style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Forgot Password?
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
