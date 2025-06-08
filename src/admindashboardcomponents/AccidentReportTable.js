import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';


const AccidentReportTable = ({ themeStyle }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/accidents') // Your backend API route
      .then(res => res.json())
      .then(data => {
        const formattedRows = data.map((item, index) => ({
          id: item._id || index,
          vehicleNo: item.vehicleNo,
          pen: item.pen,
          accidentTime: item.accidentTime,
          location: item.location,
          description: item.description,
          image: item.image?.data ? `data:${item.image.contentType};base64,${item.image.data}` : ''
        }));
        setRows(formattedRows);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching accident data:', err);
        setLoading(false);
      });
  }, []);

  const columns = [
    { field: 'vehicleNo', headerName: 'Vehicle No', width: 150 },
    { field: 'pen', headerName: 'PEN', width: 100 },
    { field: 'accidentTime', headerName: 'Time', width: 120 },
    { field: 'location', headerName: 'Location', width: 200 },
    { field: 'description', headerName: 'Description', width: 250 },
    {
      field: 'image',
      headerName: 'Photo',
      width: 130,
      renderCell: (params) => (
        params.value
          ? <img src={params.value} alt="Accident" width={60} height={40} style={{ objectFit: 'cover' }} />
          : 'No Image'
      )
    }
  ];

  return (
    <div style={{ height: 500, width: '100%', ...themeStyle }}>
      <h2>Accident Report Table</h2>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSize={5}
        rowsPerPageOptions={[5, 10]}
        style={{ background: themeStyle.background, color: themeStyle.color }}
      />
    </div>
  );
};

export default AccidentReportTable;
