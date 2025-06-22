import React, { useState, useEffect } from 'react';
import axios from 'axios';

const baseStyles = {
  container: {
    padding: '10px',
  },
  form: {
    maxWidth: '100%',
    width: '95%',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '24px',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
  },
  column: {
    flex: '1 1 100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
  },
  textarea: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    resize: 'vertical',
    width: '100%',
  },
  button: {
    marginTop: '20px',
    padding: '12px',
    fontSize: '18px',
    borderRadius: '5px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  statusText: {
    fontSize: '14px',
    marginTop: '-5px',
  }
};

const RepairRequestForm = ({ pen }) => {
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleStatus, setVehicleStatus] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [billFile, setBillFile] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (pen) {
      localStorage.setItem('pen', pen);
    }
  }, [pen]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 200 * 1024) {
      alert('File size exceeds 200KB. Please select a smaller file.');
      e.target.value = '';
      setBillFile(null);
    } else {
      setBillFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('vehicleNo', vehicleNo);
    formDataToSend.append('pen', pen);
    formDataToSend.append('date', date);
    formDataToSend.append('subject', subject);
    formDataToSend.append('description', description);
    if (billFile) {
      formDataToSend.append('billFile', billFile);
    }

    try {
      await axios.post('http://localhost:5000/api/repair-request', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Request submitted successfully');
    } catch (err) {
      console.error('Error submitting form:', err.response?.data || err.message);
      alert('Error submitting form.');
    }
  };

  return (
    <div style={baseStyles.container}>
      <form onSubmit={handleSubmit} style={baseStyles.form}>
        <h2 style={baseStyles.title}>Repair Request Form</h2>

        <div style={baseStyles.grid}>
          <div style={baseStyles.column}>
            <label>Vehicle Number</label>
            <input
              type="text"
              value={vehicleNo}
              onChange={handleVehicleChange}
              placeholder="Enter vehicle number"
              style={baseStyles.input}
              required
            />
            {vehicleStatus && (
              <p
                style={{
                  ...baseStyles.statusText,
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
              </p>
            )}

            <label>PEN Number</label>
            <input
              type="text"
              value={pen}
              readOnly
              style={{ ...baseStyles.input, backgroundColor: '#f0f0f0' }}
            />

            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={baseStyles.input}
              required
            />

            <label>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              style={baseStyles.input}
              required
            />
          </div>

          <div style={baseStyles.column}>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue"
              rows={5}
              style={baseStyles.textarea}
              required
            />

            <label>Upload image if Any (MAX 200 KB)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              style={baseStyles.input}
            />
          </div>
        </div>

        <button type="submit" style={baseStyles.button}>Submit Request</button>
      </form>
    </div>
  );
};

export default RepairRequestForm;
