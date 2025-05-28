// src/UserDetails.js
import React from 'react';

const UserDetails = ({ user }) => {
  if (!user) return null;

  return (
    <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
      <h3>User Details</h3>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.phone}</p>
      <p><strong>PEN:</strong> {user.pen}</p>
      <p><strong>General No:</strong> {user.generalNo}</p>
      <p><strong>DOB:</strong> {new Date(user.dob).toLocaleDateString()}</p>
      <p><strong>Gender:</strong> {user.gender}</p>
      <p><strong>Blood Group:</strong> {user.bloodGroup}</p>
      <p><strong>License No:</strong> {user.licenseNo}</p>
      <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
        <div>
          <img src={user.photo} alt={`${user.name}`} width="100" />
          <p>Photo</p>
        </div>
        <div>
          <img src={user.signature} alt="Signature" width="100" />
          <p>Signature</p>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
