import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserDetails from './UserDetails';
import './css/admindashboard.css'; 

function ViewRequests({ themeStyle }) {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/unverified-users');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (email) => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/verify-user/${email}`);
      setMessage('User verification successful');
      setSelectedUser(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
      setMessage('Verification failed');
      setLoading(false);
    }
  };

  const handleView = async (email) => {
    setLoadingDetails(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/user/${email}`);
      setSelectedUser(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch user details');
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="view-requests-container">
      <h2>Pending User Requests</h2>
      {message && <p className="message">{message}</p>}

      {loading ? (
        <div className="loading-spinner" />
      ) : (
        <table className="user-table">
          <thead>
            <tr style={{ backgroundColor: themeStyle.background, color: themeStyle.color }}>
              
              <th>Name</th>
              <th>PEN</th>
              <th>General No</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(user => (
              <tr key={user._id}>
              
                <td>{user.name}</td>
                <td>{user.pen}</td>
                <td>{user.generalNo}</td>
                <td>{user.email}</td>
                <td>
                  <button className="view-btn" onClick={() => handleView(user.email)}>
                    View
                  </button>
                  <button className="verify-btn" onClick={() => handleVerify(user.email)}>
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
      )}

      {loadingDetails && <div className="loading-spinner" />}
      {!loadingDetails && <UserDetails user={selectedUser} />}
    </div>
  );
}

export default ViewRequests;
