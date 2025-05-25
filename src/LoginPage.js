import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './css/form.css'; // This includes your styles

const LoginPage = () => {
  const [email, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', { email, password, role });

      if (res.data.role === 'admin') {
        localStorage.setItem('adminEmail', res.data.email);
        localStorage.setItem('adminName', res.data.name);
        localStorage.setItem('adminPen', res.data.pen);
        localStorage.setItem('adminPhoto', res.data.photo);
        localStorage.setItem('adminSignature', res.data.signature);

        navigate('/admin');
      } else if (res.data.role === 'user') {
        localStorage.setItem('userPen', res.data.pen);
        localStorage.setItem('usergeneralNo', res.data.generalNo);
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
      <form onSubmit={handleLogin} className="formStyle">
        <h2 className="headingStyle">Login</h2>

        <div className="fieldStyle">
          <label>Email</label>
          <input
            type="text"
            value={email}
            placeholder="Email"
            onChange={(e) => setUsername(e.target.value)}
            required
            className="inputStyle"
          />
        </div>

        <div className="fieldStyle">
          <label>Password</label>
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="inputStyle"
          />
        </div>

        <div className="fieldStyle">
          <label>Login as</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="inputStyle"
          >
            <option value="user">Login as User</option>
            <option value="admin">Login as Admin</option>
          </select>
        </div>

        <button type="submit" className="buttonStyle">Login</button>

        <p style={{ marginTop: 10 }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>

        <p style={{ marginTop: 20 }}>
          Forgot Password! <Link to="/ResetPassword">Rest Password</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
