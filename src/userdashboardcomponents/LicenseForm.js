import React, { useState, useEffect } from 'react';
import '../css/licenseForm.css'; // Create this CSS like EyeTestReport.css

const LicenseForm = ({ pen }) => {
  const [licenseNo, setLicenseNo] = useState('');
  const [validityDate, setValidityDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [latestLicense, setLatestLicense] = useState(null);

  useEffect(() => {
    if (!pen) return;

    fetch(`http://localhost:5000/api/license/latest/${pen}`)
      .then(res => {
        if (!res.ok) throw new Error('No license found');
        return res.json();
      })
      .then(data => setLatestLicense(data.latestLicense))
      .catch(err => {
        console.error('Error fetching license:', err);
        setLatestLicense(null);
      });
  }, [pen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 102400) {
      setFileError('File size should be less than 100KB');
      setSelectedFile(null);
    } else {
      setFileError('');
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pen || !licenseNo || !validityDate || !selectedFile) {
      alert('All fields are required and file must be under 100KB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('pen', pen);
      formData.append('licenseNo', licenseNo);
      formData.append('validityDate', validityDate);
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:5000/api/license', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('License submitted successfully!');
        setLicenseNo('');
        setValidityDate('');
        setSelectedFile(null);
        setFileError('');
        setLatestLicense(data.newLicense); // if returned
      } else {
        alert(data.message || 'Failed to submit license');
      }
    } catch (error) {
      alert('An error occurred during submission');
      console.error(error);
    }
  };

  return (
    <div className="license-container">
      <div className="license-formBox">
        <h2 className="license-heading">License Upload</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label className="license-label">PEN Number:</label>
          <input type="text" className="license-input" value={pen} readOnly />

          <label className="license-label">License Number:</label>
          <input
            type="text"
            className="license-input"
            value={licenseNo}
            onChange={(e) => setLicenseNo(e.target.value)}
            required
          />

          <label className="license-label">Validity Date:</label>
          <input
            type="date"
            className="license-input"
            value={validityDate}
            onChange={(e) => setValidityDate(e.target.value)}
            required
          />

          <label className="license-label">Upload License File:</label>
          <div className="license-fileInputBox">
            <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} />
            <p className="license-note">Supported: PDF, JPG, PNG (Max: 100KB)</p>
          </div>

          {fileError && <div className="license-error">{fileError}</div>}

          <button type="submit" className="license-button">Submit</button>
        </form>

        <div style={{ marginTop: '30px' }}>
          <h3>Latest Uploaded License:</h3>
          {latestLicense ? (
            <ul>
              <li>
                <strong>License No:</strong> {latestLicense.licenseNo}<br />
                <strong>Validity:</strong> {new Date(latestLicense.validityDate).toLocaleDateString()}<br />
                <a
  href={`http://localhost:5000/api/license/view/${pen}`}
  target="_blank"
  rel="noopener noreferrer"
>
  View License
</a>

              </li>
            </ul>
          ) : (
            <p>No license found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LicenseForm;
