import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Requests = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = () => {
    axios.get('http://localhost:5000/api/non-verified-users')
      .then((res) => setRequests(res.data))
      .catch((err) => console.error('Error fetching requests:', err));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = (pen) => {
    axios.put(`http://localhost:5000/api/verify-user/${pen}`)
      .then(() => fetchRequests())
      .catch(err => console.error('Approve failed:', err));
  };

  const handleReject = (pen) => {
    axios.delete(`http://localhost:5000/api/reject-user/${pen}`)
      .then(() => fetchRequests())
      .catch(err => console.error('Reject failed:', err));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Non-Verified User Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {requests.map((user, index) => (
            <li key={index} style={styles.card}>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>PEN:</strong> {user.pen}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <div style={styles.buttonGroup}>
                <button style={styles.approveBtn} onClick={() => handleApprove(user.pen)}>Approve</button>
                <button style={styles.rejectBtn} onClick={() => handleReject(user.pen)}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #ccc',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  buttonGroup: {
    marginTop: 10,
    display: 'flex',
    gap: 10,
  },
  approveBtn: {
    padding: '5px 10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  rejectBtn: {
    padding: '5px 10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
};

export default Requests;
