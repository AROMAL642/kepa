import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminRepairSection() {
  const [repairs, setRepairs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin-repair')
      .then(res => setRepairs(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin-repair/${id}/approve`);
      setRepairs(prev => prev.map(r => r._id === id ? { ...r, status: 'approved' } : r));
    } catch (err) {
      console.error(err);
      alert('Error approving request');
    }
  };

  const handleView = (billFile) => {
    window.open(`http://localhost:5000/uploads/${billFile}`, '_blank');

  };

  return (
    <div>
      <h2>Repair Requests</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Date</th>
            <th>User Name</th>
            <th>PEN Number</th>
            <th>Subject</th>
            <th>View</th>
            <th>Approve</th>
          </tr>
        </thead>
        <tbody>
          {repairs.length === 0 ? (
            <tr><td colSpan="6">No repair requests</td></tr>
          ) : (
            repairs.map(req => (
              <tr key={req._id}>
                <td>{req.date}</td>
                <td>{req.user?.name || 'Unknown'}</td>
<td>{req.user?.pen || 'Unknown'}</td>

                <td>{req.subject}</td>
                <td>
                  {req.billFile ? (
  <button onClick={() => handleView(req.billFile)}>View</button>
) : 'No File'}

                </td>
                <td>
                  {req.status === 'approved' ? 'Approved' : (
                    <button onClick={() => handleApprove(req._id)}>Approve</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminRepairSection;
