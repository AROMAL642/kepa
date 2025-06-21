import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import dayjs from 'dayjs'; 

const AdminStocksView = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stockroutes');
      const formatted = res.data.map((item, index) => ({
        ...item,
        id: item._id,
        sl: index + 1,
      }));
      setRows(formatted);
    } catch (err) {
      console.error('❌ Error fetching stocks:', err.message);
    }
  };

const columns = [
  { field: 'sl', headerName: 'SL', width: 70 },
  { field: 'itemType', headerName: 'Type', width: 130 },
  { field: 'itemName', headerName: 'Name', width: 150 },
  { field: 'quantity', headerName: 'Qty', width: 80 },
  { field: 'condition', headerName: 'Condition', width: 100 },
  { field: 'status', headerName: 'Status', width: 100 },
  {
    field: 'hasWarranty',
    headerName: 'Warranty',
    width: 100,
    renderCell: (params) => (params.value ? 'Yes' : 'No')
  },
  { field: 'warrantyNumber', headerName: 'Warranty No', width: 150 },
  {
    field: 'date',
    headerName: 'Date',
    width: 130,
    renderCell: (params) =>
      params.value ? dayjs(params.value).format('DD-MM-YYYY') : ''
  }
];


  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}> All Stock Entries </h2>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} pageSize={7} />
      </div>
    </div>
  );
};

export default AdminStocksView;
