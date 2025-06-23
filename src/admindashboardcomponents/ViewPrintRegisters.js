import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Checkbox,
  ListItemText,
  OutlinedInput
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const excludedFields = ['createdAt', 'updatedAt', 'hasWarranty', '__v', '_id', 'previousKm', 'kmpl', 'fullTank', 'file', 'fileType'];

const ViewPrintRegisters = () => {
  const [registerType, setRegisterType] = useState('');
  const [vehicleOption, setVehicleOption] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);

  const validate = () => {
    if (!registerType || !fromDate || !toDate) {
      alert('Please fill all required fields');
      return false;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      alert('From Date cannot be later than To Date');
      return false;
    }
    if (
      ['fuel', 'movement', 'accident'].includes(registerType) &&
      vehicleOption === 'individual' &&
      !vehicleNumber.trim()
    ) {
      alert('Please enter a vehicle number');
      return false;
    }
    return true;
  };

  const buildPayload = () => ({
    vehicleOption,
    vehicleNumber: vehicleOption === 'individual' ? vehicleNumber.trim() : 'ALL',
    fromDate,
    toDate
  });

  const handleViewClick = async () => {
    if (!validate()) return;

    try {
      const payload = buildPayload();
      const res = await axios.post(
        `http://localhost:5000/api/report/${registerType}/json`,
        payload
      );

      const data = res.data;
      if (!data || data.length === 0) {
        alert('No data found');
        setRows([]);
        setColumns([]);
        return;
      }

      const dateFields = ['date', 'accidentTime', 'startTime', 'endTime'];

      const filteredData = data.map(row => {
        const cleaned = {};
        Object.entries(row).forEach(([key, value]) => {
          if (!excludedFields.includes(key)) {
            cleaned[key] = value;
          }
        });
        return cleaned;
      });

      let fieldSet = new Set();
      filteredData.forEach(row => {
        Object.keys(row).forEach(key => fieldSet.add(key));
      });

      if (registerType === 'purchase') {
        fieldSet.add('warrantyNumber');
      }

      let cols = Array.from(fieldSet).map((key) => ({
        field: key,
        headerName:
          key === 'enteredBy' ? 'Entered By (Name - PEN)' :
          key === 'warrantyNumber' ? 'Warranty Number' :
          key.toUpperCase(),
        flex: 1
      }));

      if (registerType === 'purchase') {
        const billNoIndex = cols.findIndex(col => col.field === 'billNo');
        const warrantyCol = cols.find(col => col.field === 'warrantyNumber');
        cols = cols.filter(col => col.field !== 'warrantyNumber');
        if (billNoIndex !== -1 && warrantyCol) {
          cols.splice(billNoIndex + 1, 0, warrantyCol);
        }
      }

      const rowsWithId = filteredData.map((row, idx) => {
        const formatted = { id: idx + 1 };
        Array.from(fieldSet).forEach((key) => {
          const value = row[key];
          if (dateFields.includes(key) && value) {
            formatted[key] = formatDate(value);
          } else {
            formatted[key] = value || '';
          }
        });
        return formatted;
      });

      setColumns(cols);
      setRows(rowsWithId);
      setSelectedFields(cols.map(col => col.field));
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch report data.');
    }
  };

  const handlePrintPDF = () => {
    if (rows.length === 0 || columns.length === 0) {
      alert('No data to print');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${registerType.toUpperCase()} Register Report`, 14, 22);

    const visibleCols = columns.filter(col => selectedFields.includes(col.field));
    const headers = visibleCols.map(col => col.headerName);
    const data = rows.map(row => visibleCols.map(col => row[col.field]));

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 160, 133] }
    });

    doc.save(`${registerType}_selected_columns_${Date.now()}.pdf`);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        View & Print Registers
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
        <FormControl fullWidth sx={{ minWidth: 250 }}>
          <InputLabel>Select Register</InputLabel>
          <Select
            value={registerType}
            onChange={(e) => {
              setRegisterType(e.target.value);
              setVehicleOption('');
              setVehicleNumber('');
            }}
            label="Select Register"
          >
            <MenuItem value="fuel">Fuel Register</MenuItem>
            <MenuItem value="movement">Movement Register</MenuItem>
            <MenuItem value="accident">Accident Register</MenuItem>
            <MenuItem value="purchase">Purchase Register</MenuItem>
            <MenuItem value="stock">Stock Register</MenuItem>
          </Select>
        </FormControl>

        {['fuel', 'movement', 'accident'].includes(registerType) && (
          <FormControl fullWidth sx={{ minWidth: 250 }}>
            <InputLabel>Vehicle Scope</InputLabel>
            <Select
              value={vehicleOption}
              onChange={(e) => {
                setVehicleOption(e.target.value);
                if (e.target.value === 'all') setVehicleNumber('');
              }}
              label="Vehicle Scope"
            >
              <MenuItem value="all">All Vehicles</MenuItem>
              <MenuItem value="individual">Individual Vehicle</MenuItem>
            </Select>
          </FormControl>
        )}

        {vehicleOption === 'individual' && (
          <TextField
            placeholder="eg.KL01AA1234"
            label="Vehicle Number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            fullWidth
          />
        )}

        <TextField
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="To Date"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <Button variant="contained" onClick={handleViewClick}>
          View Report
        </Button>
      </Box>

      {columns.length > 0 && (
        <>
          <FormControl fullWidth sx={{ mt: 4 }}>
            <InputLabel>Select Columns to Print</InputLabel>
            <Select
              multiple
              value={selectedFields}
              onChange={(e) => setSelectedFields(e.target.value)}
              input={<OutlinedInput label="Select Columns to Print" />}
              renderValue={(selected) => selected.join(', ')}
            >
              {columns.map((col) => (
                <MenuItem key={col.field} value={col.field}>
                  <Checkbox checked={selectedFields.includes(col.field)} />
                  <ListItemText primary={col.headerName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={handlePrintPDF}>
              Download Selected Columns as PDF
            </Button>
          </Box>
        </>
      )}

      {rows.length > 0 && (
        <Box sx={{ height: 500, width: '100%', mt: 4 }}>
          <DataGrid rows={rows} columns={columns} />
        </Box>
      )}
    </Box>
  );
};

export default ViewPrintRegisters;
