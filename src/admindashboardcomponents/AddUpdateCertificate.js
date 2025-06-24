import React, { useState } from 'react';
import '../css/addupdatecertificate.css';

function AddUpdateCertificate() {
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    insurancePolicyNo: '',
    insuranceValidity: '',
    insuranceIssuedDate: '',
    insuranceExpense: '',
    insuranceFile: null,
    pollutionCertificateNo: '',
    pollutionValidity: '',
    pollutionIssuedDate: '',
    pollutionExpense: '',
    pollutionFile: null
  });

  const openMongoFile = (file) => {
    if (!file?.data?.data || !file.contentType) {
      alert('File not found');
      return;
    }
    const byteArray = new Uint8Array(file.data.data);
    const blob = new Blob([byteArray], { type: file.contentType });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleSearch = async () => {
    setError('');
    setVehicleData(null);

    try {
      const res = await fetch(`http://localhost:5000/api/vehicle/data/${vehicleNo}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Vehicle not found');
        return;
      }

      const data = await res.json();
      setVehicleData(data.vehicle);

      const latest = data.vehicle.certificateHistory?.[data.vehicle.certificateHistory.length - 1];

      setForm({
        insurancePolicyNo: latest?.insurancePolicyNo || '',
        insuranceValidity: latest?.insuranceValidity?.slice(0, 10) || '',
        insuranceIssuedDate: latest?.insuranceIssuedDate?.slice(0, 10) || '',
        insuranceExpense: latest?.insuranceExpense || '',
        pollutionCertificateNo: latest?.pollutionCertificateNo || '',
        pollutionValidity: latest?.pollutionValidity?.slice(0, 10) || '',
        pollutionIssuedDate: latest?.pollutionIssuedDate?.slice(0, 10) || '',
        pollutionExpense: latest?.pollutionExpense || '',
        insuranceFile: null,
        pollutionFile: null
      });
    } catch (err) {
      console.error(err);
      setError('Error fetching vehicle details.');
    }
  };

  const handleUpdate = async () => {
    const {
      insurancePolicyNo,
      pollutionCertificateNo
    } = form;

    if (!insurancePolicyNo || !pollutionCertificateNo) {
      alert('Insurance Policy Number and Pollution Certificate Number are required.');
      return;
    }

    const formData = new FormData();
    formData.append('vehicleNo', vehicleNo);

    formData.append('insurancePolicyNo', form.insurancePolicyNo);
    formData.append('insuranceValidity', form.insuranceValidity);
    formData.append('insuranceIssuedDate', form.insuranceIssuedDate);
    formData.append('insuranceExpense', form.insuranceExpense);

    formData.append('pollutionCertificateNo', form.pollutionCertificateNo);
    formData.append('pollutionValidity', form.pollutionValidity);
    formData.append('pollutionIssuedDate', form.pollutionIssuedDate);
    formData.append('pollutionExpense', form.pollutionExpense);

    if (form.insuranceFile) formData.append('insuranceFile', form.insuranceFile);
    if (form.pollutionFile) formData.append('pollutionFile', form.pollutionFile);

    try {
      const res = await fetch('http://localhost:5000/api/vehicle/update-certificates', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
      if (res.ok) {
        alert('Certificates updated successfully!');
        handleSearch(); // Refresh
      } else {
        alert(result.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error during update.');
    }
  };

  const latestCert = vehicleData?.certificateHistory?.[vehicleData.certificateHistory.length - 1];

  return (
    <div className="certificate-container">
      <h2>View & Update Certificates</h2>

      <div className="search-section">
        <input
          type="text"
          placeholder="Enter Vehicle Number"
          value={vehicleNo}
          onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      {vehicleData && (
        <div className="certificate-details">
          <h3>Latest Certificate Details</h3>

          <p><strong>Insurance Policy No:</strong> {latestCert?.insurancePolicyNo || 'N/A'}</p>
          <p><strong>Insurance Issued Date:</strong> {latestCert?.insuranceIssuedDate?.slice(0, 10) || 'N/A'}</p>
          <p><strong>Insurance Validity:</strong> {latestCert?.insuranceValidity?.slice(0, 10) || 'N/A'}</p>
          <p><strong>Insurance Expense:</strong> ₹{latestCert?.insuranceExpense || 'N/A'}</p>
          {latestCert?.insuranceFile && (
            <p><strong>Insurance File:</strong>{' '}
              <button onClick={() => openMongoFile(latestCert.insuranceFile)}>View</button>
            </p>
          )}

          <p><strong>Pollution Certificate No:</strong> {latestCert?.pollutionCertificateNo || 'N/A'}</p>
          <p><strong>Pollution Issued Date:</strong> {latestCert?.pollutionIssuedDate?.slice(0, 10) || 'N/A'}</p>
          <p><strong>Pollution Validity:</strong> {latestCert?.pollutionValidity?.slice(0, 10) || 'N/A'}</p>
          <p><strong>Pollution Expense:</strong> ₹{latestCert?.pollutionExpense || 'N/A'}</p>
          {latestCert?.pollutionFile && (
            <p><strong>Pollution File:</strong>{' '}
              <button onClick={() => openMongoFile(latestCert.pollutionFile)}>View</button>
            </p>
          )}

          <div className="update-form">
            <h4>Update Certificates</h4>

            <label>Insurance Policy Number *</label>
            <input
              type="text"
              value={form.insurancePolicyNo}
              onChange={(e) => setForm({ ...form, insurancePolicyNo: e.target.value })}
              required
            />

            <label>Insurance Issued Date</label>
            <input
              type="date"
              value={form.insuranceIssuedDate}
              onChange={(e) => setForm({ ...form, insuranceIssuedDate: e.target.value })}
            />

            <label>Insurance Validity</label>
            <input
              type="date"
              value={form.insuranceValidity}
              onChange={(e) => setForm({ ...form, insuranceValidity: e.target.value })}
            />

            <label>Insurance Expense</label>
            <input
              type="number"
              value={form.insuranceExpense}
              onChange={(e) => setForm({ ...form, insuranceExpense: e.target.value })}
            />

            <label>Insurance Certificate File</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setForm({ ...form, insuranceFile: e.target.files[0] })}
            />

            <label>Pollution Certificate Number *</label>
            <input
              type="text"
              value={form.pollutionCertificateNo}
              onChange={(e) => setForm({ ...form, pollutionCertificateNo: e.target.value })}
              required
            />

            <label>Pollution Issued Date</label>
            <input
              type="date"
              value={form.pollutionIssuedDate}
              onChange={(e) => setForm({ ...form, pollutionIssuedDate: e.target.value })}
            />

            <label>Pollution Validity</label>
            <input
              type="date"
              value={form.pollutionValidity}
              onChange={(e) => setForm({ ...form, pollutionValidity: e.target.value })}
            />

            <label>Pollution Expense</label>
            <input
              type="number"
              value={form.pollutionExpense}
              onChange={(e) => setForm({ ...form, pollutionExpense: e.target.value })}
            />

            <label>Pollution Certificate File</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setForm({ ...form, pollutionFile: e.target.files[0] })}
            />

            <button onClick={handleUpdate}>Update</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddUpdateCertificate;
