import React, { useState } from 'react';


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

  const handleSearch = async () => {
    setError('');
    setVehicleData(null);

    try {
      const res = await fetch(`http://localhost:5000/api/vehicle/check/${vehicleNo}`);
      const data = await res.json();

      if (data.exists) {
        const vehicleRes = await fetch(`http://localhost:5000/api/vehicle/data/${vehicleNo}`); // you may need to implement this
        const vehicleDetail = await vehicleRes.json();
        setVehicleData(vehicleDetail.vehicle);
      } else {
        setError('Vehicle number not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching vehicle.');
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
          <p><strong>Insurance Policy No:</strong> {vehicleData.insurance?.policyNo || 'N/A'}</p>
          <p><strong>Insurance Validity:</strong> {vehicleData.insurance?.validity || 'N/A'}</p>
          <p><strong>Pollution Validity:</strong> {vehicleData.pollution?.validity || 'N/A'}</p>

          <div className="update-form">
            <h4>Update Certificates</h4>
            <input
              type="text"
              placeholder="Insurance Policy Number"
              value={form.insurancePolicyNo}
              onChange={(e) => setForm({ ...form, insurancePolicyNo: e.target.value })}
            />
            <input
              type="date"
              value={form.insuranceValidity}
              onChange={(e) => setForm({ ...form, insuranceValidity: e.target.value })}
            />
            <label>Insurance Certificate File:</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setForm({ ...form, insuranceFile: e.target.files[0] })}
            />

            <input
              type="date"
              value={form.pollutionValidity}
              onChange={(e) => setForm({ ...form, pollutionValidity: e.target.value })}
            />
            <label>Pollution Certificate File:</label>
            <input
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
