import React, { useState } from 'react';



function FuelRegister({ darkMode }) {
  const themeStyle = {
    background: darkMode ? '#121212' : '#fff',
    color: darkMode ? '#f1f1f1' : '#000',
    borderColor: darkMode ? '#555' : '#ccc'
  };

  const [fuelForm, setFuelForm] = useState({
    vehicleNo: '',
    firmName: '',
    presentKm: '',
    quantity: '',
    amount: '',
    previousKm: '',
    kmpl: '',
    date: '',
    billNo: '',
    fullTank: '',
    file: null
  });

  const handleFuelChange = async (e) => {
    const { name, value, type, files } = e.target;
    const updatedForm = {
      ...fuelForm,
      [name]: type === 'file' ? files[0] : value
    };

    // Fetch previousKm when vehicleNo changes
    if (name === 'vehicleNo' && value) {
      try {
        const res = await fetch(`http://localhost:5000/api/fuel/previousKm/${value}`);
        const data = await res.json();
        if (res.ok) {
          updatedForm.previousKm = data.previousKm;
        }
      } catch (error) {
        console.error('Failed to fetch previousKm:', error);
      }
    }

    const present = parseFloat(updatedForm.presentKm);
    const previous = parseFloat(updatedForm.previousKm);
    const quantity = parseFloat(updatedForm.quantity);

    // Auto-calculate KMPL
    if (!isNaN(present) && !isNaN(previous) && !isNaN(quantity) && quantity !== 0) {
      const distance = present - previous;
      const kmpl = (distance / quantity).toFixed(2);
      updatedForm.kmpl = kmpl;
    }

    setFuelForm(updatedForm);
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let key in fuelForm) {
      formData.append(key, fuelForm[key]);
    }

    try {
      const res = await fetch('http://localhost:5000/api/fuel', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok) alert(data.message);
      else alert('Failed to save fuel data');
    } catch (err) {
      console.error(err);
      alert('Error submitting fuel data');
    }
  };

  return (
    <div className="containerStyle" style={themeStyle}>
      <h2 className="headingStyle">Fuel Entry Form</h2>
      <form className="formStyle" onSubmit={handleFuelSubmit}>
        {[
          { label: 'Vehicle Number', name: 'vehicleNo' },
          { label: 'Firm Name', name: 'firmName' },
          { label: 'Present km', name: 'presentKm', type: 'number' },
          { label: 'Quantity of Fuel', name: 'quantity', type: 'number' },
          { label: 'Amount', name: 'amount', type: 'number' },
          { label: 'Previous km', name: 'previousKm', type: 'number' },
          { label: 'KMPL', name: 'kmpl', type: 'number' },
          { label: 'Date', name: 'date', type: 'date' },
          { label: 'Bill No.', name: 'billNo', type: 'number' }
        ].map(field => (
          <div className="fieldStyle" key={field.name}>
            <label>{field.label}</label>
            <input
              className="inputStyle"
              name={field.name}
              type={field.type || 'text'}
              value={fuelForm[field.name] || ''}
              onChange={handleFuelChange}
              style={themeStyle}
            />
          </div>
        ))}

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
          <label>Upload Bill</label>
          <input type="file" name="file" onChange={handleFuelChange} />
        </div>

        <button type="submit" className="buttonStyle">Submit</button>
      </form>
    </div>
  );
}

export default FuelRegister;
