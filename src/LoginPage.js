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
      } else if (res.data.role === 'user') {
        localStorage.setItem('userPen', res.data.pen);
        localStorage.setItem('userGeneralNo', res.data.generalNo);
        localStorage.setItem('userEmail', res.data.email);
        localStorage.setItem('userName', res.data.name);
        localStorage.setItem('userPhone', res.data.phone);
        localStorage.setItem('userDob', res.data.dob);
        localStorage.setItem('userLicenseNo', res.data.licenseNo);
        localStorage.setItem('userBloodGroup', res.data.bloodGroup);
        localStorage.setItem('userGender', res.data.gender);
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
