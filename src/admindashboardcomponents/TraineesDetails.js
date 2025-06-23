import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import '../css/traineesdetails.css';

const licenseOptions = ['2W No Gear', '2W With Gear', '3W', '4W'];

const TraineesDetails = ({ themeStyle }) => {
  const [formData, setFormData] = useState({
    cadetNo: '',
    name: '',
    hasLicense: 'No',
    licenseType: [],
    licenseNumber: '',
    licenseValidity: '',
    dob: '',
    gender: '',
    address: '',
    company: '',
    joiningDate: '',
  });

  const [trainees, setTrainees] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLicenseTypeChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const updated = checked
        ? [...prev.licenseType, value]
        : prev.licenseType.filter((type) => type !== value);
      return { ...prev, licenseType: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/trainees/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save trainee');
      alert('Trainee saved successfully!');
      setFormData({
        cadetNo: '',
        name: '',
        hasLicense: 'No',
        licenseType: [],
        licenseNumber: '',
        licenseValidity: '',
        dob: '',
        gender: '',
        address: '',
        company: '',
        joiningDate: '',
      });
    } catch (err) {
      setError(err.message);
      alert('Error saving trainee: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/trainees/all');
      if (!res.ok) throw new Error('Failed to fetch trainees');
      const data = await res.json();
      const validated = data.map((t) => ({
        id: t._id,
        ...t,
      }));
      setTrainees(validated);
      setShowTable(true);
    } catch (err) {
      setError(err.message);
      alert('Error fetching trainees: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'cadetNo', headerName: 'Cadet No', width: 120 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'hasLicense', headerName: 'Has License', width: 120 },
    {
      field: 'licenseType',
      headerName: 'License Type',
      width: 180,
      renderCell: (params) =>
        params.row.licenseType.length > 0 ? params.row.licenseType.join(', ') : 'N/A',
    },
    { field: 'licenseNumber', headerName: 'License No', width: 150 },
    {
      field: 'licenseValidity',
      headerName: 'License Validity',
      width: 150,
      renderCell: (params) =>
        params.row.licenseValidity
          ? new Date(params.row.licenseValidity).toLocaleDateString()
          : 'N/A',
    },
    {
      field: 'dob',
      headerName: 'DOB',
      width: 120,
      renderCell: (params) =>
        params.row.dob ? new Date(params.row.dob).toLocaleDateString() : 'N/A',
    },
    { field: 'gender', headerName: 'Gender', width: 100 },
    { field: 'address', headerName: 'Address', width: 200 },
    { field: 'company', headerName: 'Company', width: 150 },
    {
      field: 'joiningDate',
      headerName: 'Joining Date',
      width: 150,
      renderCell: (params) =>
        params.row.joiningDate
          ? new Date(params.row.joiningDate).toLocaleDateString()
          : 'N/A',
    },
  ];

  return (
    <div className="trainee-container" style={themeStyle}>
      <div className="trainee-header">
        <h2>Trainees Details</h2>
        <button
          onClick={showTable ? () => setShowTable(false) : fetchTrainees}
          disabled={loading}
          className={`trainee-button ${showTable ? 'back' : 'view'}`}
        >
          {loading ? 'Loading...' : showTable ? 'Back to Form' : 'View All Records'}
        </button>
      </div>

      {error && <div className="error-message">Error: {error}</div>}

      {!showTable ? (
        <form onSubmit={handleSubmit} className="trainee-form">
          <label>Cadet No</label>
          <input type="text" name="cadetNo" value={formData.cadetNo} onChange={handleChange} required />

          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />

          <label>Has License</label>
          <select name="hasLicense" value={formData.hasLicense} onChange={handleChange} required>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>

          {formData.hasLicense === 'Yes' && (
            <>
              <label>License Types</label>
              <div className="license-checkboxes">
                {licenseOptions.map((type) => (
                  <label key={type}>
                    <input
                      type="checkbox"
                      value={type}
                      checked={formData.licenseType.includes(type)}
                      onChange={handleLicenseTypeChange}
                    />
                    {type}
                  </label>
                ))}
              </div>

              <label>License Number</label>
              <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} />

              <label>License Validity</label>
              <input type="date" name="licenseValidity" value={formData.licenseValidity} onChange={handleChange} />
            </>
          )}

          <label>Date of Birth</label>
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />

          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label>Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} required />

          <label>Company</label>
          <input type="text" name="company" value={formData.company} onChange={handleChange} required />

          <label>Joining Date</label>
          <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required />

          <button type="submit" className="trainee-submit" disabled={loading}>
            {loading ? 'Saving...' : 'Submit'}
          </button>
        </form>
      ) : (
        <div style={{ height: 500, width: '100%', marginTop: 30 }}>
          <DataGrid rows={trainees} columns={columns} pageSize={5} loading={loading} disableRowSelectionOnClick />
        </div>
      )}
    </div>
  );
};

export default TraineesDetails;
