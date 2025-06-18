import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

function FuelRegister({ darkMode, pen }) {
  const themeStyle = {
    background: darkMode ? '#121212' : '#fff',
    color: darkMode ? '#f1f1f1' : '#000',
    borderColor: darkMode ? '#555' : '#ccc'
  };

  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [validVehicles, setValidVehicles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fuelForm, setFuelForm] = useState({
    vehicleNo: '',
    pen: pen || '',
    firmName: '',
    presentKm: '',
    quantity: '',
    amount: '',
    previousKm: '',
    kmpl: '',
    date: new Date().toISOString().split('T')[0],
    billNo: '',
    fullTank: 'no',
    file: null,
    fuelType: ''
  });

  useEffect(() => {
    const fetchVehicleNumbers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/vehicles/numbers');
        const data = await response.json();
        if (data.success) {
          setValidVehicles(data.vehicles);
        }
      } catch (err) {
        console.error('Failed to fetch vehicle numbers:', err);
      }
    };
    fetchVehicleNumbers();
  }, []);

  const handleFuelChange = async (e) => {
    const { name, value, type, files } = e.target;
    const newValue = name === 'vehicleNo' ? value.toUpperCase() : value;

    let updatedForm = {
      ...fuelForm,
      [name]: type === 'file' ? files[0] : newValue
    };

    // Vehicle number validation and fetching previousKm
    if (name === 'vehicleNo') {
      const isValid = validVehicles.includes(newValue);
      setError(isValid ? '' : 'Invalid vehicle number - not registered in system');

      if (isValid && newValue) {
        try {
          const response = await fetch(`http://localhost:5000/api/fuel/previousKm/${newValue}`);
          const data = await response.json();
          if (response.ok) {
            updatedForm.previousKm = data.previousKm || 0;
          } else {
            updatedForm.previousKm = 0;
          }
        } catch (error) {
          console.error('Error fetching previous KM:', error);
          updatedForm.previousKm = 0;
        }
      } else {
        updatedForm.previousKm = '';
      }
    }

    // Calculate KMPL
    if (['presentKm', 'previousKm', 'quantity'].includes(name) || name === 'vehicleNo') {
      const present = parseFloat(updatedForm.presentKm) || 0;
      const previous = parseFloat(updatedForm.previousKm) || 0;
      const quantity = parseFloat(updatedForm.quantity) || 0;
      if (present > 0 && previous >= 0 && quantity > 0 && present > previous) {
        updatedForm.kmpl = (present - previous) / quantity;
        updatedForm.kmpl = updatedForm.kmpl.toFixed(2);
      } else {
        updatedForm.kmpl = '';
      }
    }

    setFuelForm(updatedForm);
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const requiredFields = [
      'vehicleNo', 'pen', 'presentKm',
      'quantity', 'amount', 'date',
      'billNo', 'fuelType'
    ];
    const missingFields = requiredFields.filter(field => !fuelForm[field]);

    if (missingFields.length > 0) {
      setError(`Please fill all required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    if (isNaN(fuelForm.presentKm) || isNaN(fuelForm.quantity) || isNaN(fuelForm.amount)) {
      setError('Please enter valid numbers for KM, Quantity, and Amount');
      setIsSubmitting(false);
      return;
    }

    if (!validVehicles.includes(fuelForm.vehicleNo)) {
      setError('Please enter a valid vehicle number');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    Object.entries(fuelForm).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'file' && value instanceof File) {
          formData.append(key, value);
        } else if (key !== 'file') {
          formData.append(key, value);
        }
      }
    });

    try {
      const res = await fetch('http://localhost:5000/api/fuel', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setOpen(true);
        setFuelForm({
          vehicleNo: '',
          pen: pen || '',
          firmName: '',
          presentKm: '',
          quantity: '',
          amount: '',
          previousKm: '',
          kmpl: '',
          date: new Date().toISOString().split('T')[0],
          billNo: '',
          fullTank: 'no',
          file: null,
          fuelType: ''
        });
      } else {
        setError(data.message || 'Failed to save fuel data');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="containerStyle" style={themeStyle}>
      <h2 className="headingStyle">Fuel Entry Form</h2>
      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}

      <form className="formStyle" onSubmit={handleFuelSubmit}>
        <div className="fieldStyle">
          <label>Vehicle Number*</label>
          <input
            className="inputStyle"
            name="vehicleNo"
            type="text"
            value={fuelForm.vehicleNo}
            onChange={handleFuelChange}
            style={{
              ...themeStyle,
              borderColor: fuelForm.vehicleNo
                ? (validVehicles.includes(fuelForm.vehicleNo) ? 'green' : 'red')
                : themeStyle.borderColor
            }}
            required
            list="vehicleNumbers"
          />
          <datalist id="vehicleNumbers">
            {validVehicles.map((number, index) => (
              <option key={index} value={number} />
            ))}
          </datalist>
          {fuelForm.vehicleNo && !validVehicles.includes(fuelForm.vehicleNo) && (
            <div style={{ color: 'red', fontSize: '0.8rem' }}>
              Invalid vehicle number
            </div>
          )}
        </div>

        {/* Fuel Type Dropdown */}
        <div className="fieldStyle">
          <label>Fuel Type*</label>
          <select
            className="inputStyle"
            name="fuelType"
            value={fuelForm.fuelType}
            onChange={handleFuelChange}
            style={themeStyle}
            required
          >
            <option value="">-- Select Fuel Type --</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
          </select>
        </div>

        {[
          { label: 'Firm Name', name: 'firmName', required: true },
          { label: 'Present km', name: 'presentKm', type: 'number', required: true },
          { label: 'Quantity of Fuel', name: 'quantity', type: 'number', required: true },
          { label: 'Amount', name: 'amount', type: 'number', required: true },
          { label: 'Previous km', name: 'previousKm', type: 'number', readOnly: true },
          { label: 'KMPL', name: 'kmpl', type: 'number', readOnly: true },
          { label: 'Date', name: 'date', type: 'date', required: true },
          { label: 'Bill No.', name: 'billNo', required: true }
        ].map(field => (
          <div className="fieldStyle" key={field.name}>
            <label>{field.label}{field.required && '*'}</label>
            <input
              className="inputStyle"
              name={field.name}
              type={field.type || 'text'}
              value={fuelForm[field.name] || ''}
              onChange={handleFuelChange}
              style={themeStyle}
              readOnly={field.readOnly}
              required={field.required}
            />
          </div>
        ))}

        <div className="fieldStyle">
          <label>PEN*</label>
          <input
            className="inputStyle"
            name="pen"
            type="text"
            value={fuelForm.pen}
            readOnly
            style={{
              ...themeStyle,
              backgroundColor: '#e0e0e0',
              cursor: 'not-allowed'
            }}
          />
        </div>

        <div className="fieldStyle">
          <label>Full Tank:</label>
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name="fullTank"
              value="yes"
              checked={fuelForm.fullTank === 'yes'}
              onChange={handleFuelChange}
            />
            Yes
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name="fullTank"
              value="no"
              checked={fuelForm.fullTank === 'no'}
              onChange={handleFuelChange}
            />
            No
          </label>
        </div>

        <div className="fieldStyle">
          <label>Upload Bill (required)</label>
          <input
            type="file"
            name="file"
            onChange={handleFuelChange}
            accept="image/*,.pdf"
            required
          />
        </div>

        <button
          type="submit"
          className="buttonStyle"
          disabled={isSubmitting || !validVehicles.includes(fuelForm.vehicleNo)}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {/* Dialog for Success */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>Fuel details saved successfully!</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default FuelRegister;
