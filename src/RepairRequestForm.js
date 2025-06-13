import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const RequestRepairForm = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    // userName: '',
    pen: '',
    vehicleNo: '',
    subject: '',
    description: '',
    billFile: null,
  });

  const [status, setStatus] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setFormData((prev) => ({
        ...prev,
        //userName: storedUser.name || '',
        pen: storedUser.pen || '',
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'billFile') {
      setFormData({ ...formData, billFile: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');

    try {
      const backendUrl = 'http://localhost:5000';

      const maxSize = 1 * 1024 * 1024; // 1 MB
      if (formData.billFile && formData.billFile.size > maxSize) {
        setStatus('❌ File too large. Max size is 1MB.');
        return;
      }

      const payload = new FormData();
      payload.append('date', formData.date);
      payload.append('pen', formData.pen);
      
      payload.append('vehicleNo', formData.vehicleNo);
      payload.append('subject', formData.subject);
      payload.append('description', formData.description);
      if (formData.billFile) {
        payload.append('billFile', formData.billFile);
      }

      await axios.post(`${backendUrl}/api/repair-request`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setStatus('✅ Request submitted successfully!');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        //userName: formData.userName,
        pen: formData.pen,
        vehicleNo: '',
        subject: '',
        description: '',
        billFile: null,
      });
    } catch (err) {
      console.error('Error submitting:', err);
      setStatus(`❌ Submission failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formContainer">
      <h2 className="title">Repair Request Form</h2>

      <div className="gridContainer">
        <div className="leftColumn">
          <div className="formGroup">
            <label className="label">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              readOnly
              className="input readOnly"
            />
          </div>

          

          <div className="formGroup">
            <label className="label">PEN Number</label>
            <input
              type="text"
              name="pen"
              value={formData.pen}
              readOnly
              className="input readOnly"
            />
          </div>

          <div className="formGroup">
            <label className="label">Vehicle Number</label>
            <input
              type="text"
              name="vehicleNo"
              value={formData.vehicleNo}
              onChange={handleChange}
              className="input"
              placeholder="Enter vehicle number"
              required
            />
          </div>

          <div className="formGroup">
            <label className="label">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="input"
              placeholder="Repair subject"
              required
            />
          </div>
        </div>

        <div className="rightColumn">
          <div className="formGroup">
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea"
              rows={5}
              placeholder="Describe the issue"
              required
            ></textarea>
          </div>

          <div className="formGroup">
            <label className="label">Upload Bill (Optional, Max 1MB)</label>
            <input
              type="file"
              name="billFile"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange}
              className="fileInput"
            />
          </div>
        </div>
      </div>

      <div className="submitContainer">
        <button type="submit" className="submitButton">Submit Request</button>
        {status && <p className="statusText">{status}</p>}
      </div>
    </form>
  );
};

export default RequestRepairForm;
