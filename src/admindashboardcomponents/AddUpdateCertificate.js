import React, { useState } from 'react';
import '../css/addupdatecertificate.css';

function AddUpdateCertificate() {
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    insurancePolicyNo: '',
    insuranceValidity: '',
    insuranceFile: null,
    pollutionValidity: '',
    pollutionFile: null
  });

  // Convert base64 buffer to Blob and open in new tab
  const openBase64File = (file) => {
    const byteCharacters = atob(file.buffer);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length);
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: file.mimetype });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL, '_blank');
  };

  const handleSearch = async () => {
    setError('');
    setVehicleData(null);

    try {
      const res = await fetch(`http://localhost:5000/api/vehicle/searchvehicle?number=${vehicleNo}`);
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Vehicle not found');
        return;
      }

      const data = await res.json();
      setVehicleData(data);

      setForm({
        insurancePolicyNo: data.insurancePolicyNo || '',
        insuranceValidity: data.insuranceValidity?.slice(0, 10) || '',
        pollutionValidity: data.pollutionValidity?.slice(0, 10) || '',
        insuranceFile: null,
        pollutionFile: null
      });
    } catch (err) {
      console.error(err);
      setError('Error fetching vehicle details.');
    }
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append('vehicleNo', vehicleNo);
    formData.append('insurancePolicyNo', form.insurancePolicyNo);
    formData.append('insuranceValidity', form.insuranceValidity);
    formData.append('pollutionValidity', form.pollutionValidity);
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
        handleSearch(); // Refresh data
      } else {
        alert(result.message || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
      alert('Server error while updating');
    }
  };

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
          <h3>Current Certificate Details</h3>

          <p><strong>Insurance Policy No:</strong> {vehicleData.insurancePolicyNo || 'N/A'}</p>
          <p><strong>Insurance Validity:</strong> {vehicleData.insuranceValidity?.slice(0, 10) || 'N/A'}</p>
          <p><strong>Pollution Validity:</strong> {vehicleData.pollutionValidity?.slice(0, 10) || 'N/A'}</p>

          {vehicleData.insuranceFile?.buffer && (
            <p>
              <strong>Insurance File:</strong>{' '}
              <button onClick={() => openBase64File(vehicleData.insuranceFile)}>View File</button>
            </p>
          )}

          {vehicleData.pollutionFile?.buffer && (
            <p>
              <strong>Pollution File:</strong>{' '}
              <button onClick={() => openBase64File(vehicleData.pollutionFile)}>View File</button>
            </p>
          )}

          <div className="update-form">
            <h4>Update Certificates</h4>

            <label htmlFor="insurancePolicyNo">Insurance Policy Number</label>
            <input
              id="insurancePolicyNo"
              type="text"
              placeholder="Insurance Policy Number"
              value={form.insurancePolicyNo}
              onChange={(e) => setForm({ ...form, insurancePolicyNo: e.target.value })}
            />

            <label htmlFor="insuranceValidity">Insurance Validity</label>
            <input
              id="insuranceValidity"
              type="date"
              value={form.insuranceValidity}
              onChange={(e) => setForm({ ...form, insuranceValidity: e.target.value })}
            />

            <label htmlFor="insuranceFile">Insurance Certificate File</label>
            <input
              id="insuranceFile"
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setForm({ ...form, insuranceFile: e.target.files[0] })}
            />

            <label htmlFor="pollutionValidity">Pollution Validity</label>
            <input
              id="pollutionValidity"
              type="date"
              value={form.pollutionValidity}
              onChange={(e) => setForm({ ...form, pollutionValidity: e.target.value })}
            />

            <label htmlFor="pollutionFile">Pollution Certificate File</label>
            <input
              id="pollutionFile"
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setForm({ ...form, pollutionFile: e.target.files[0] })}
            />

            <button className="update-btn" onClick={handleUpdate}>Update</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddUpdateCertificate;
