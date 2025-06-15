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

      const { role } = res.data;

      if (role === 'admin') {
        const adminData = {
          name: res.data.name,
          email: res.data.email,
          pen: res.data.pen,
          generalNo: res.data.generalNo,
          phone: res.data.phone,
          dob: res.data.dob,
          licenseNo: res.data.licenseNo,
          bloodGroup: res.data.bloodGroup,
          gender: res.data.gender,
          photo: res.data.photo,
          signature: res.data.signature,
          role: role || 'Admin'
        };

        localStorage.setItem('adminData', JSON.stringify(adminData));
        navigate('/admin');
      }

      else if (role === 'user') {
        const user = {
          name: res.data.name,
          pen: res.data.pen,
          generalNo: res.data.generalNo,
          email: res.data.email,
          phone: res.data.phone,
          dob: res.data.dob,
          licenseNo: res.data.licenseNo,
          bloodGroup: res.data.bloodGroup,
          gender: res.data.gender,
          photo: res.data.photo,
          signature: res.data.signature
        };
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/user');
      }

      else if (role === 'fuel' || role === 'mechanic') {
        // Shared format for fuel & mechanic dashboards
        localStorage.setItem('fuelPen', res.data.pen);
        localStorage.setItem('fuelEmail', res.data.email);
        localStorage.setItem('fuelName', res.data.name);
        localStorage.setItem('fuelPhone', res.data.phone);
        localStorage.setItem('fuelDob', res.data.dob);
        localStorage.setItem('fuelLicenseNo', res.data.licenseNo);
        localStorage.setItem('fuelBloodGroup', res.data.bloodGroup);
        localStorage.setItem('fuelGender', res.data.gender);
        localStorage.setItem('fuelPhoto', res.data.photo);
        localStorage.setItem('fuelSignature', res.data.signature);
        localStorage.setItem('fuelRole', role);

        // Redirect appropriately
        if (role === 'fuel') navigate('/fuel');
        else if (role === 'mechanic') navigate('/mechanic');
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
        <button type="submit" className="buttonStyle">Login</button>
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