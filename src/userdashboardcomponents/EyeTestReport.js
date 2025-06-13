import React, { useState, useEffect } from 'react';
import '../css/EyeTestReport.css';

const EyeTestReport = ({ themeStyle, pen }) => {
  const [eyeTestReports, setEyeTestReports] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (!pen) return;

    fetch(`http://localhost:5000/api/eyetests/${pen}`)
      .then(res => {
        if (!res.ok) throw new Error('No report found');
        return res.json();
      })
      .then(data => {
        setEyeTestReports([data.latestReport]);
      })
      .catch(err => {
        console.error('Error fetching eye test report:', err);
        setEyeTestReports([]);
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

    if (!pen) {
      alert('PEN number is missing.');
      return;
    }

    if (!date) {
      alert('Please select a date.');
      return;
    }

    if (!selectedFile) {
      alert('Please select a valid file under 100KB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('pen', pen);
      formData.append('date', date);
      formData.append('reportFile', selectedFile);

      const response = await fetch('http://localhost:5000/api/eyetests/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('Eye Test Report submitted successfully!');
        setSelectedFile(null);
        setDate('');
        setFileError('');
        setEyeTestReports(prev => [data.newReport, ...prev]);
      } else {
        alert(data.message || 'Failed to submit report');
      }
    } catch (error) {
      alert('An error occurred during submission');
      console.error(error);
    }
  };

  return (
    <div className="etr-container">
      <div className="etr-formBox">
        <h2 className="etr-heading">Eye Test Report</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label className="etr-label">PEN Number:</label>
          <input type="text" className="etr-input" value={pen} readOnly />

          <label className="etr-label">Date of Certificate</label>
          <input
            type="date"
            className="etr-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label className="etr-label">Upload Eye Test Report:</label>
          <div className="etr-fileInputBox">
            <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} />
            <p className="etr-note">
              Supported formats: PDF, JPG, PNG (Max size: 100KB)
            </p>
          </div>

          {fileError && <div className="etr-error">{fileError}</div>}

          <button type="submit" className="etr-button">Submit</button>
        </form>

        <div style={{ marginTop: '30px' }}>
          <h3>Latest Uploaded Report:</h3>
          {eyeTestReports.length === 0 ? (
            <p>No reports found.</p>
          ) : (
            <ul>
              <li>
                <strong>Date:</strong> {new Date(eyeTestReports[0].date).toLocaleDateString()}<br />
                <a
                  href={`http://localhost:5000/api/eyetests/view/${pen}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Report
                </a>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default EyeTestReport;
