import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography
} from '@mui/material';
import axios from 'axios';

function Expense({ onBack, themeStyle }) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    setResult(null);

    if (!vehicleNumber.trim() || !expenseType || !fromDate || !toDate) {
      alert('Please fill in all fields.');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      alert('From Date cannot be after To Date.');
      return;
    }

    if (expenseType === 'fuel') {
      try {
        const res = await axios.post('http://localhost:5000/api/fuel/expense-summary', {
          vehicleNo: vehicleNumber.trim(),
          fromDate,
          toDate
        });

        const { totalAmount, count } = res.data;
        setResult(`Total Fuel Expense: ₹${totalAmount} from ${count} entries`);
      } catch (error) {
        console.error('Error fetching fuel expense:', error);
        alert('Failed to fetch fuel expense');
      }
    } else {
      alert(`Expense type "${expenseType}" not implemented yet.`);
    }
  };

  return (
    <Box sx={{ p: 3 }} style={themeStyle}>
      <Typography variant="h5" gutterBottom>
        Expense Details
      </Typography>

      <Button onClick={onBack} className="back-btn" sx={{ mb: 2 }}>
        ← Back
      </Button>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 400 }}>
        <TextField
          label="Vehicle Number"
          placeholder="e.g., KL01AA1234"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Expense Type</InputLabel>
          <Select
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
            label="Expense Type"
          >
            <MenuItem value="fuel">Fuel</MenuItem>
            <MenuItem value="repair">Repair</MenuItem>
            <MenuItem value="insurance">Insurance</MenuItem>
            <MenuItem value="pollution">Pollution</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <TextField
          label="To Date"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <Button variant="contained" onClick={handleSubmit}>
          View Expense
        </Button>

        {result && (
          <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold', color: '#2c3e50' }}>
            {result}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default Expense;
