import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Expense = ({ onBack, themeStyle }) => {
  const [vehicleNo, setVehicleNo] = useState('');
  const [category, setCategory] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(null);

  const handleViewExpense = async () => {
    if (!vehicleNo || !category || !fromDate || !toDate) {
      alert('Please fill all fields');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/fuel/expense-summary', {
        vehicleNo,
        category,
        fromDate,
        toDate
      });

      const { entries, totalAmount } = res.data;

      const formattedRows = entries.map((entry, index) => ({
        id: index + 1,
        vehicleNo,
        date: entry.date?.substring(0, 10),
        penName: entry.penName || `${entry.name || 'N/A'} (${entry.pen || '-'})`,
        amount: entry.amount
      }));

      setRows(formattedRows);
      setTotal(totalAmount);
    } catch (error) {
      console.error('Error fetching expense:', error);
      alert('Failed to fetch expense data');
    }
  };

  const handlePrintReport = () => {
    const doc = new jsPDF();
    const title = `${category.charAt(0).toUpperCase() + category.slice(1)} Expense Report`;

    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(11);
    doc.text(`Vehicle No: ${vehicleNo}`, 14, 25);
    doc.text(`From: ${fromDate}  To: ${toDate}`, 14, 32);
    doc.text(`Total ${category} Expense: ₹${total}`, 14, 39);

    const tableHead = category === 'insurance' || category === 'pollution'
      ? [['Vehicle Number', 'Date', 'Amount']]
      : [['Vehicle Number', 'Date', 'Name (PEN)', 'Amount']];

    const tableBody = rows.map(row =>
      category === 'insurance' || category === 'pollution'
        ? [row.vehicleNo, row.date, row.amount]
        : [row.vehicleNo, row.date, row.penName, row.amount]
    );

    doc.autoTable({
      startY: 45,
      head: tableHead,
      body: tableBody
    });

    doc.save(`${category}_Expense_Report_${vehicleNo}_${fromDate}_to_${toDate}.pdf`);
  };

  const columns = [
    { field: 'vehicleNo', headerName: 'Vehicle Number', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    ...(category === 'insurance' || category === 'pollution'
      ? []
      : [{ field: 'penName', headerName: 'Name (PEN)', flex: 1.5 }]
    ),
    { field: 'amount', headerName: 'Amount', flex: 1 }
  ];

  return (
    <Box sx={{ p: 4 }} style={themeStyle}>
      <Typography variant="h5" gutterBottom>Expense Details</Typography>
      <Button onClick={onBack} variant="outlined" sx={{ mb: 2 }}>← Back</Button>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField
          label="Vehicle Number"
          value={vehicleNo}
          onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
        />
        <TextField
          label="Category"
          select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="fuel">Fuel</MenuItem>
          <MenuItem value="repair">Repair</MenuItem>
          <MenuItem value="insurance">Insurance</MenuItem>
          <MenuItem value="pollution">Pollution</MenuItem>
        </TextField>
        <TextField
          label="From Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <TextField
          label="To Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <Button variant="contained" onClick={handleViewExpense}>View Expense</Button>
        {rows.length > 0 && (
          <Button variant="outlined" color="secondary" onClick={handlePrintReport}>
            Print Report
          </Button>
        )}
      </Box>

      {rows.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Total {category.charAt(0).toUpperCase() + category.slice(1)} Expense: ₹{total}
          </Typography>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid rows={rows} columns={columns} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default Expense;
