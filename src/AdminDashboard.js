import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState({ name: '', pen: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('adminName');
    const pen = localStorage.getItem('adminPen');

    if (name && pen) {
      setAdminData({ name, pen });
    }
  }, []);

  const goToRequests = () => {
    navigate('/requests');
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={styles.adminInfo}>
          <div>
            <div><strong>{adminData.name}</strong></div>
            <div>PEN: {adminData.pen}</div>
          </div>
          <img
            src="/images/admin_photo.png"
            alt="Admin"
            style={styles.adminImage}
          />
        </div>
      </div>

      <div style={styles.buttonGrid}>
        <button style={styles.button} onClick={goToRequests}>Show Requests</button>
        <button style={styles.button}>Vehicle Details</button>
        <button style={styles.button}>Add Vehicle</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: 20,
    background: '#f2f2f2',
    minHeight: '100vh',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    borderRadius: 8,
  },
  adminInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  adminImage: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  buttonGrid: {
    display: 'flex',
    gap: 20,
    marginTop: 40,
    justifyContent: 'center',
  },
  button: {
    width: 400,
    height: 200,
    backgroundColor: '#6A64F1',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    fontSize: 12,
    cursor: 'pointer',
  },
};

export default AdminDashboard;
