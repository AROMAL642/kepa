import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminRepairSection = () => {
  const [repairRequests, setRepairRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://localhost:5000/api/repair-requests/pending');
        setRepairRequests(res.data);
      } catch (err) {
        setError('Failed to fetch repair requests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleViewBill = (url) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('No bill uploaded for this request.');
    }
  };

  const handleApprove = async (id) => {
    const confirmApprove = window.confirm('Are you sure you want to approve this request?');
    if (!confirmApprove) return;

    try {
      setVerifyingId(id);
      await axios.post(`http://localhost:5000/api/repair-requests/verify/${id}`);
      setRepairRequests(prev => prev.filter(req => req._id !== id));
      alert('Request approved successfully.');
    } catch (err) {
      alert('Approval failed.');
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div style={container}>
      <h2 style={header}>Pending Repair Requests</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && repairRequests.length === 0 && (
        <p style={{ textAlign: 'center' }}>No pending repair requests.</p>
      )}

      {!loading && repairRequests.length > 0 && (
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Sl. No</th>
              <th style={th}>Vehicle No</th>
              <th style={th}>User Name</th>
              <th style={th}>PEN No</th>
              <th style={th}>Subject</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {repairRequests.map((req, index) => (
              <tr key={req._id}>
                <td style={td}>{index + 1}</td>
                <td style={td}>{req.vehicleNumber || 'N/A'}</td>
                <td style={td}>{req.userName}</td>
                <td style={td}>{req.penNumber}</td>
                <td style={td}>{req.subject || 'N/A'}</td>
                <td style={td}>
                  <button
                    onClick={() => handleViewBill(req.billUrl)}
                    style={viewBtn}
                    disabled={!req.billUrl}
                  >
                    View Bill
                  </button>
                  <button
                    onClick={() => handleApprove(req._id)}
                    style={approveBtn}
                    disabled={verifyingId === req._id}
                  >
                    {verifyingId === req._id ? 'Approving...' : 'Approve'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// === CSS STYLES ===

const container = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '8px',
  margin: '20px auto',
  maxWidth: '90%',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
};

const header = {
  textAlign: 'center',
  marginBottom: '20px',
  fontSize: '24px',
  fontWeight: 'bold',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '16px',
};

const th = {
  backgroundColor: '#f2f2f2',
  padding: '10px',
  border: '1px solid #ccc',
  textAlign: 'center',
  fontWeight: 'bold',
};

const td = {
  padding: '10px',
  border: '1px solid #ddd',
  textAlign: 'center',
};

const viewBtn = {
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  padding: '6px 12px',
  marginRight: '8px',
  borderRadius: '4px',
  cursor: 'pointer',
};

const approveBtn = {
  backgroundColor: 'green',
  color: '#fff',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default AdminRepairSection;



