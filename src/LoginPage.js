import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress'; // ✅ Import MUI loader
import './css/loginform.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [pen, setPen] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // ✅ loading state

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loader

    try {
      const res = await axios.post('http://localhost:5000/login', { pen, password });
      const { role } = res.data;

      if (role === 'admin') {
        const adminData = { ...res.data, role: 'admin' };
        localStorage.setItem('adminData', JSON.stringify(adminData));
        navigate('/mainadmin');
      } else if (role === 'mti') {
        const mtiData = { ...res.data, role: 'MTI' };
        localStorage.setItem('adminData', JSON.stringify(mtiData));
        navigate('/admin');
      } else if (role === 'user') {
        const user = { ...res.data };
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/user');
      } else if (role === 'fuel' || role === 'mechanic' || role === 'repair') {
        const commonData = { ...res.data };
        localStorage.setItem('adminData', JSON.stringify(commonData));
        Object.entries(commonData).forEach(([key, value]) => {
          const localStorageKey = `${role}${key.charAt(0).toUpperCase()}${key.slice(1)}`;
          localStorage.setItem(localStorageKey, value);
        });
        navigate(`/${role}`);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Network or server error';
      alert('Login failed: ' + msg);
    } finally {
      setLoading(false); // Stop loader
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

        <button type="submit" className="buttonStyle" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
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
            onClick={() => navigate('/resetpassword')}
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
