import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './css/form.css'; // This includes your styles

const ResetPassword = () => {
  const [email, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/ResetPassword', { email, role });

      if (res.data.role === 'admin') {
        localStorage.setItem('adminEmail', res.data.email);


        navigate('/admin');
      } else if (res.data.role === 'user') {
        localStorage.setItem('userEmail', res.data.email);


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


        <p style={{ marginTop: 20 }}>
          go to login page <Link to="/login">Rest Password</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
