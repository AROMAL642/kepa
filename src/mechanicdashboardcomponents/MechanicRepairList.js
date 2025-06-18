import React, { useEffect, useState } from 'react';

function MechanicVerifiedRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [needsParts, setNeedsParts] = useState(false);
  const [partsList, setPartsList] = useState([{ item: '', quantity: 1 }]);
  const [billFile, setBillFile] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/repairRequestRoutes/verified')
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch', err);
        setLoading(false);
      });
  }, []);

  const handlePartChange = (index, field, value) => {
    const updated = [...partsList];
    updated[index][field] = value;
    setPartsList(updated);
  };

  const addPartRow = () => {
    setPartsList([...partsList, { item: '', quantity: 1 }]);
  };

  const handleSubmitFeedback = async () => {
    const requestId = selectedRequest._id;
    const payload = {
      mechanicFeedback: feedback,
      needsParts,
      partsList,
    };

    if (billFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        payload.billFile = {
          data: base64,
          contentType: billFile.type
        };

        await submitUpdate(requestId, payload);
      };
      reader.readAsDataURL(billFile);
    } else {
      await submitUpdate(requestId, payload);
    }
  };

  const submitUpdate = async (id, payload) => {
    try {
      const res = await fetch(`http://localhost:5000/api/repairRequestRoutes/${id}/mechanic-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const updatedRequest = await res.json();
      alert('Mechanic feedback submitted.');
      setSelectedRequest(null);
      setRequests(prev =>
        prev.map(req => (req._id === updatedRequest._id ? updatedRequest : req))
      );
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Submission failed.');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Verified Repair Requests (Mechanic View)</h2>
      {requests.length === 0 ? (
        <p>No verified requests found.</p>
      ) : (
        <table className="request-table" border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Vehicle No</th>
              <th>Date</th>
              <th>Subject</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id}>
                <td>{req.vehicleNo}</td>
                <td>{req.date}</td>
                <td>{req.subject}</td>
                <td>{req.description}</td>
                <td>{req.status}</td>
                <td>
                  <button onClick={() => setSelectedRequest(req)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedRequest && (
        <div style={{
          marginTop: '20px',
          border: '1px solid #ccc',
          padding: '20px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>Update Repair Request: {selectedRequest.vehicleNo}</h3>

          <label>Mechanic Feedback:</label><br />
          <textarea
            rows={4}
            cols={50}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          /><br /><br />

          <label>
            <input
              type="checkbox"
              checked={needsParts}
              onChange={e => setNeedsParts(e.target.checked)}
            />
            Needs Parts
          </label><br />

          {needsParts && partsList.map((part, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Item"
                value={part.item}
                onChange={e => handlePartChange(index, 'item', e.target.value)}
              />
              <input
                type="number"
                min="1"
                value={part.quantity}
                onChange={e => handlePartChange(index, 'quantity', e.target.value)}
              />
            </div>
          ))}

          {needsParts && <button onClick={addPartRow}>Add Part</button>}
          <br /><br />

          <label>Upload Final Bill (optional):</label><br />
          <input type="file" accept="application/pdf,image/*" onChange={e => setBillFile(e.target.files[0])} />
          <br /><br />

          <button onClick={handleSubmitFeedback}>Submit Feedback</button>{' '}
          <button onClick={() => setSelectedRequest(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default MechanicVerifiedRequests;
