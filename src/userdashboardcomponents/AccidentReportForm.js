import React, { useState, useEffect } from 'react';


const AccidentReportForm = ({ themeStyle, pen }) => {
  const [vehicleNo, setVehicleNo] = useState('');
  const [accidentTime, setAccidentTime] = useState('');
  const [vehicleStatus, setVehicleStatus] = useState('');
  const [accidentReports, setAccidentReports] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/accidents')
      .then(res => res.json())
      .then(data => setAccidentReports(data))
      .catch(err => console.error('Error fetching accident reports:', err));
  }, []);

  const handleVehicleChange = async (e) => {
    const value = e.target.value.toUpperCase().trim();
    setVehicleNo(value);

    const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
    if (!vehicleRegex.test(value)) {
      setVehicleStatus('Invalid Format');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/check/${value}`);
      const data = await res.json();
      setVehicleStatus(data.exists ? 'Valid' : 'Not Found');
    } catch (err) {
      console.error('Error checking vehicle:', err);
      setVehicleStatus('Error');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please select a smaller file.');
      e.target.value = '';
      setImageFile(null);
    } else {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (vehicleStatus !== 'Valid') {
      alert('Please enter a valid and registered vehicle number!');
      return;
    }

    const formData = new FormData();
    formData.append('vehicleNo', vehicleNo);
    formData.append('pen', pen);
    formData.append('accidentTime', accidentTime);
    formData.append('location', e.target.location.value);
    formData.append('description', e.target.description.value);
    if (imageFile) formData.append('image', imageFile);

    try {
      const response = await fetch('http://localhost:5000/api/accidents', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        alert('Accident form submitted successfully!');
      } else {
        alert('Error submitting accident form.');
      }
    } catch (error) {
      console.error(error);
      alert('Error submitting form.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formContainer">
      <h2 className="title">Accident Report Form</h2>
      <div className="gridContainer">
        <div className="leftColumn">
          <div className="formGroup">
            <label className="label">Vehicle Number</label>
            <input
              type="text"
              value={vehicleNo}
              onChange={handleVehicleChange}
              placeholder="Enter vehicle number"
              className="input"
              required
            />
            {vehicleStatus && (
              <div
                className="statusMessage"
                style={{
                  color:
                    vehicleStatus === 'Valid'
                      ? 'green'
                      : vehicleStatus === 'Not Found' || vehicleStatus === 'Invalid Format'
                      ? 'red'
                      : 'orange',
                }}
              >
                {vehicleStatus === 'Valid'
                  ? '✅ Vehicle Number is Valid'
                  : vehicleStatus === 'Not Found'
                  ? '❌ Vehicle Not Found in Database'
                  : vehicleStatus === 'Invalid Format'
                  ? '❌ Invalid Vehicle Number Format'
                  : 'Error Checking Vehicle'}
              </div>
            )}
          </div>

          <div className="formGroup">
            <label className="label">PEN Number</label>
            <input
              type="text"
              value={pen}
              readOnly
              className="input readOnly"
            />
          </div>

          <div className="formGroup">
            <label className="label">Date of Accident</label>
            <input type="date" name="date" className="input" required />
          </div>

          <div className="formGroup">
            <label className="label">Time of Accident (24h format)</label>
            <input
              type="time"
              value={accidentTime}
              onChange={(e) => setAccidentTime(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="formGroup">
            <label className="label">Location</label>
            <input
              name="location"
              type="text"
              placeholder="Enter location"
              className="input"
              required
            />
          </div>
        </div>

        <div className="rightColumn">
          <div className="formGroup">
            <label className="label">Description</label>
            <textarea
              name="description"
              placeholder="Describe the accident"
              rows={4}
              className="textarea"
              required
            ></textarea>
          </div>

          <div className="formGroup">
            <label className="label">Upload Image (MAX 5 MB)</label>
            <div className="uploadBox">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="fileInput"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="submitContainer">
        <button type="submit" className="submitButton">Submit Report</button>
      </div>
    </form>
  );
};

export default AccidentReportForm;
