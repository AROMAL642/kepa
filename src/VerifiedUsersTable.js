import React, { useEffect, useState } from 'react';
import './css/verifieduserstable.css'; // Updated CSS import

const VerifiedUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerifiedUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/verified-users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching verified users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedUsers();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner"></div>
    );
  }

  if (!users.length) {
    return (
      <div className="no-users-message">
        No verified users found.
      </div>
    );
  }

  return (
    <div className="verified-users-container">
      <h2 className="section-title">Verified Users</h2>
      <div className="table-responsive">
        <table className="verified-users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>PEN</th>
              <th>General No</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.pen}</td>
                <td>{user.generalNo}</td>
                <td>{user.phone}</td>
                <td>
                  <button className="profile-btn">View Full Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerifiedUsersTable;