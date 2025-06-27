import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress
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
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const handleViewExpense = async () => {
    if (!vehicleNo || !category || !fromDate || !toDate) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    setNoData(false);

    try {
      const res = await axios.post('http://localhost:5000/api/fuel/expense-summary', {
        vehicleNo,
        category,
        fromDate,
        toDate
      });

      const { entries, totalAmount } = res.data;

      if (!entries || entries.length === 0) {
        setNoData(true);
        setRows([]);
        setTotal(null);
      } else {
        let formattedRows = [];

        if (category === 'repair') {
          formattedRows = entries.map((entry, index) => ({
            id: index + 1,
            vehicleNo: entry.vehicleNo,
            date: entry.date?.substring(0, 10),
            expense: entry.expense,
            workerWage: entry.workerWage,
            totalExpense: entry.totalExpense
          }));
        } else if (category === 'fuel') {
          formattedRows = entries.map((entry, index) => ({
            id: index + 1,
            vehicleNo,
            date: entry.date?.substring(0, 10),
            penName: `${entry.name || 'N/A'} (${entry.pen || '-'})`,
            amount: entry.amount
          }));
        } else if (category === 'all') {
          formattedRows = entries.map((entry, index) => ({
            id: index + 1,
            vehicleNo: entry.vehicleNo,
            category: entry.category,
            totalExpense: entry.totalExpense
          }));
        } else {
          formattedRows = entries.map((entry, index) => ({
            id: index + 1,
            vehicleNo,
            date: entry.date?.substring(0, 10),
            policyNo: entry.policyNo || 'N/A',
            validity: entry.validity ? entry.validity.substring(0, 10) : 'N/A',
            amount: entry.amount
          }));
        }

        setRows(formattedRows);
        setTotal(totalAmount);
      }
    } catch (error) {
      console.error('Error fetching expense:', error);
      alert('Failed to fetch expense data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    const doc = new jsPDF();
    const title = category === 'all' ? 'All Expenses Summary' : `${category.charAt(0).toUpperCase() + category.slice(1)} Expense Report`;

    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(11);
    doc.text(`Vehicle No: ${vehicleNo}`, 14, 25);
    doc.text(`From: ${fromDate}  To: ${toDate}`, 14, 32);
    doc.text(`Total Expense: ${total}`, 14, 39);

    let tableHead = [];
    let tableBody = [];

    if (category === 'repair') {
      tableHead = [['Vehicle Number', 'Date', 'Expense', 'Worker Wage', 'Total Expense']];
      tableBody = rows.map(row => [
        row.vehicleNo,
        row.date,
        row.expense,
        row.workerWage,
        row.totalExpense
      ]);
    } else if (category === 'fuel') {
      tableHead = [['Vehicle Number', 'Date', 'Name (PEN)', 'Amount']];
      tableBody = rows.map(row => [
        row.vehicleNo,
        row.date,
        row.penName,
        row.amount
      ]);
    } else if (category === 'all') {
      tableHead = [['Vehicle Number', 'Category', 'Total Expense']];
      tableBody = rows.map(row => [
        row.vehicleNo,
        row.category,
        row.totalExpense
      ]);
    } else {
      tableHead = [['Vehicle Number', 'Issued Date', 'Policy/Cert No', 'Validity', 'Amount']];
      tableBody = rows.map(row => [
        row.vehicleNo,
        row.date,
        row.policyNo,
        row.validity,
        row.amount
      ]);
    }

    doc.autoTable({
      startY: 45,
      head: tableHead,
      body: tableBody
    });

    doc.save(`${category}_Expense_Report_${vehicleNo}_${fromDate}_to_${toDate}.pdf`);
  };

  const columns = (() => {
    if (category === 'repair') {
      return [
        { field: 'vehicleNo', headerName: 'Vehicle Number', flex: 1 },
        { field: 'date', headerName: 'Date', flex: 1 },
        { field: 'expense', headerName: 'Expense', flex: 1 },
        { field: 'workerWage', headerName: 'Worker Wage', flex: 1 },
        { field: 'totalExpense', headerName: 'Total Expense', flex: 1 }
      ];
    } else if (category === 'fuel') {
      return [
        { field: 'vehicleNo', headerName: 'Vehicle Number', flex: 1 },
        { field: 'date', headerName: 'Date', flex: 1 },
        { field: 'penName', headerName: 'Name (PEN)', flex: 1.5 },
        { field: 'amount', headerName: 'Amount', flex: 1 }
      ];
    } else if (category === 'all') {
      return [
        { field: 'vehicleNo', headerName: 'Vehicle Number', flex: 1 },
        { field: 'category', headerName: 'Category', flex: 1 },
        { field: 'totalExpense', headerName: 'Total Expense', flex: 1 }
      ];
    } else {
      return [
        { field: 'vehicleNo', headerName: 'Vehicle Number', flex: 1 },
        { field: 'date', headerName: 'Issued Date', flex: 1 },
        { field: 'policyNo', headerName: 'Policy/Cert No', flex: 1 },
        { field: 'validity', headerName: 'Validity', flex: 1 },
        { field: 'amount', headerName: 'Amount', flex: 1 }
      ];
    }
  })();

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
          <MenuItem value="all">All Expense</MenuItem>
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
        <Button variant="contained" onClick={handleViewExpense} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'View Expense'}
        </Button>
        {rows.length > 0 && !loading && (
          <Button variant="outlined" color="secondary" onClick={handlePrintReport}>
            Print Report
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : noData ? (
        <Typography sx={{ mt: 4 }} color="text.secondary">
          No data found for the selected filters.
        </Typography>
      ) : rows.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Total Expense: ₹{total}
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
