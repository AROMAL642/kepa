// frontend/components/RequestRepairForm.js

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const RequestRepairForm = () => {
  const [formData, setFormData] = useState({
    appNo: '',
    vehicleNo: '',
    subject: '',
    description: '',
    bill: null,
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'bill') {
      setFormData({ ...formData, bill: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');


    const backendUrl = 'http://localhost:5000';
    try {
      // Step 1: Submit the repair request
      

      const repairRes = await axios.post(`${backendUrl}/api/repair-request`, {
        appNo: formData.appNo,
        vehicleNo: formData.vehicleNo,
        subject: formData.subject,
        description: formData.description,
      });

      const requestId = repairRes.data.requestId;

      // Step 2: Upload the bill if present
      if (formData.bill) {
  // 🔐 Check file size before uploading (e.g., 10MB limit)
         const maxSize = 1 * 1024 * 1024; // 10MB
         if (formData.bill.size > maxSize) {
            setStatus('❌ File is too large. Please upload a file smaller than 1MB.');
            return;
         }

  const billData = new FormData();
  billData.append('bill', formData.bill);

  await axios.post(`${backendUrl}/api/repair-request/${requestId}/upload-bill`, billData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}


      setStatus('Request submitted successfully ✅');
      setFormData({
        appNo: '',
        vehicleNo: '',
        subject: '',
        description: '',
        bill: null,
      });
    } catch (err) {
      console.error('Full error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      setStatus(`❌ Submission failed: ${errorMsg}`);
    }
  };

  return (
  <form onSubmit={handleSubmit} className="p-6 max-w-3xl bg-white shadow-md rounded">
    <h2 className="text-2xl">Submit Repair Request</h2>

    <input
      type="text"
      name="appNo"
      value={formData.appNo}
      onChange={handleChange}
      placeholder="Application No"
      required
      className="input mt-2"
    />

    <input
      type="text"
      name="vehicleNo"
      value={formData.vehicleNo}
      onChange={handleChange}
      placeholder="Vehicle No"
      required
      className="input mt-2"
    />

    <input
      type="text"
      name="subject"
      value={formData.subject}
      onChange={handleChange}
      placeholder="Subject"
      required
      className="input mt-2"
    />

    <textarea
      name="description"
      value={formData.description}
      onChange={handleChange}
      placeholder="Description"
      required
      className="input mt-2"
    />

    <label className="mt-4 block">Upload Bill </label>
    <input
      type="file"
      name="bill"
      onChange={handleChange}
      accept=".pdf,.jpg,.jpeg,.png"
      className="mt-2"
    />

    <button type="submit" className="btn mt-6">
      Submit Request
    </button>

    {status && <p className="mt-4 text-sm text-gray-500">{status}</p>}
  </form>
);

};

export default RequestRepairForm;



