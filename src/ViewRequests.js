import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserDetails from './UserDetails'; // Import the new component

function ViewRequests({ themeStyle }) {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/unverified-users');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Error fetching requests');
    }
  };

  const handleVerify = async (email) => {
    try {
      await axios.put(`http://localhost:5000/api/verify-user/${email}`);
      setMessage('✅ User verification successful');
      setSelectedUser(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
      setMessage('❌ Verification failed');
    }
  };

  const handleView = async (email) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/${email}`);
      setSelectedUser(res.data); // Pass this to UserDetails
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to fetch user details');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Pending User Requests</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: themeStyle.background, color: themeStyle.color }}>
            <th>Email</th>
            <th>Name</th>
            <th>PEN</th>
            <th>General No</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(user => (
            <tr key={user._id} style={{ textAlign: 'center' }}>
              <td>{user.email}</td>
              <td>{user.name}</td>
              <td>{user.pen}</td>
              <td>{user.generalNo}</td>
              <td>
                <button
                  style={{
                    padding: '5px 10px',
                    backgroundColor: 'blue',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    marginRight: '5px'
                  }}
                  onClick={() => handleView(user.email)}
                >
                  View
                </button>
                <button
                  style={{
                    padding: '5px 10px',
                    backgroundColor: 'green',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px'
                  }}
                  onClick={() => handleVerify(user.email)}
                >
                  Verify
                </button>
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan="5" style={{ padding: '10px', color: themeStyle.color }}>
                No pending requests
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Render UserDetails separately */}
      <UserDetails user={selectedUser} />
    </div>
  );
}

export default ViewRequests;
