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
    const { insurancePolicyNo, pollutionCertificateNo } = form;
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
        handleSearch();
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
          <div className="cert-info">
            <p><strong>Insurance Policy No:</strong> {latestCert?.insurancePolicyNo || 'N/A'}</p>
            <p><strong>Issued Date:</strong> {latestCert?.insuranceIssuedDate?.slice(0, 10) || 'N/A'}</p>
            <p><strong>Validity:</strong> {latestCert?.insuranceValidity?.slice(0, 10) || 'N/A'}</p>
            <p><strong>Expense:</strong> ₹{latestCert?.insuranceExpense || 'N/A'}</p>
            {latestCert?.insuranceFile && <button onClick={() => openMongoFile(latestCert.insuranceFile)}>View Insurance</button>}
            <p><strong>Pollution Certificate No:</strong> {latestCert?.pollutionCertificateNo || 'N/A'}</p>
            <p><strong>Issued Date:</strong> {latestCert?.pollutionIssuedDate?.slice(0, 10) || 'N/A'}</p>
            <p><strong>Validity:</strong> {latestCert?.pollutionValidity?.slice(0, 10) || 'N/A'}</p>
            <p><strong>Expense:</strong> ₹{latestCert?.pollutionExpense || 'N/A'}</p>
            {latestCert?.pollutionFile && <button onClick={() => openMongoFile(latestCert.pollutionFile)}>View Pollution</button>}
          </div>

          <div className="update-form">
            <h4>Update Certificates</h4>
            {[
              ['Insurance Policy Number *', 'insurancePolicyNo', 'text'],
              ['Insurance Issued Date', 'insuranceIssuedDate', 'date'],
              ['Insurance Validity', 'insuranceValidity', 'date'],
              ['Insurance Expense', 'insuranceExpense', 'number'],
              ['Insurance File', 'insuranceFile', 'file'],
              ['Pollution Certificate Number *', 'pollutionCertificateNo', 'text'],
              ['Pollution Issued Date', 'pollutionIssuedDate', 'date'],
              ['Pollution Validity', 'pollutionValidity', 'date'],
              ['Pollution Expense', 'pollutionExpense', 'number'],
              ['Pollution File', 'pollutionFile', 'file']
            ].map(([label, name, type]) => (
              <div key={name} className="form-group">
                <label>{label}</label>
                <input
                  type={type}
                  value={type !== 'file' ? form[name] : undefined}
                  onChange={(e) =>
                    setForm({ ...form, [name]: type !== 'file' ? e.target.value : e.target.files[0] })
                  }
                />
              </div>
            ))}
            <button onClick={handleUpdate}>Update</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddUpdateCertificate;