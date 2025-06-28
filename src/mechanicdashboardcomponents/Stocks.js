import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { Button } from '@mui/material';

const AllStocks = () => {
  const [rows, setRows] = useState([]);
  const [viewAll, setViewAll] = useState(false);

  const fetchStockData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/repair-request/mechanic-requests'); // ✅ Correct route

     const filteredRequests = res.data.filter(req =>
      viewAll
        ? ['sanctioned_for_work', 'ongoing_work', 'work_completed', 'completed'].includes(req.status)
        : ['sanctioned_for_work', 'ongoing_work', 'work_completed'].includes(req.status)
    );

      const extractedRows = [];
         let globalSerial = 1;

      filteredRequests.forEach((req, ) => {
        if (req.partsList && Array.isArray(req.partsList)) {
          req.partsList.forEach((part, partIndex) => {
            extractedRows.push({
              id: `${req._id}-${partIndex}`,
              slno:globalSerial++,
              vehicleNo: req.vehicleNo || 'N/A',
              itemName: part.item || 'N/A', // ✅ Correct key
              quantity: part.quantity || 0,
              date: part.date
                ? new Date(part.date).toLocaleDateString()
                : req.date
                  ? new Date(req.date).toLocaleDateString()
                  : 'N/A',
              status: req.status
            });
          });
        }
      });

      setRows(extractedRows);
    } catch (error) {
      console.error('❌ Error fetching parts data:', error);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [viewAll]);

  const columns = [
    { field: 'slno', headerName: 'Sl No', width: 80 },
    { field: 'vehicleNo', headerName: 'Vehicle No', width: 130 },
    { field: 'itemName', headerName: 'Item Name', width: 180 },
    { field: 'quantity', headerName: 'Quantity', width: 100 },
    { field: 'date', headerName: 'Date', width: 130 },
    { field: 'status', headerName: 'Status', width: 160 },
  ];

  return (
    <div style={{ padding: '20px', height: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>🛠️ Stocks of Spare Parts</h2>
        <Button
  variant="contained"
  color="primary"
  onClick={() => setViewAll(prev => !prev)}
>
  {viewAll ? 'View Only Sanctioned' : 'View All'}
</Button>

      </div>
      <div style={{ flexGrow: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </div>
    </div>
  );
};

export default AllStocks;
