import React, { useEffect, useState, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Badge, Box } from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const AdminRepairTable = ({ themeStyle }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);

  const [mechanicRequests, setMechanicRequests] = useState([]);
  const [showMechanicTab, setShowMechanicTab] = useState(false);
  const [mechanicDialogOpen, setMechanicDialogOpen] = useState(false);
  const [selectedMechanicRequest, setSelectedMechanicRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('repair'); // 'repair', 'mechanic', or 'certificates'
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [certificateFilter, setCertificateFilter] = useState('all');

  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyEntry, setVerifyEntry] = useState(null);

const [completedRequests, setCompletedRequests] = useState([]);
const [workBillDialogOpen, setWorkBillDialogOpen] = useState(false);
const [workBillData, setWorkBillData] = useState(null);
const [selectedRequest, setSelectedRequest] = useState(null);
const pendingCount = rows.filter(row => row.status === 'pending').length;
const [editMode, setEditMode] = useState(false); // at top of your component
const [editedParts, setEditedParts] = useState([]);

const [billDialogOpen, setBillDialogOpen] = useState(false);

const certificateGenCount = certificateRequests.filter(r => (r.status || '').toLowerCase() === 'for_generating_certificate').length;

  
 
  const fetchRepairs = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/repair-request');
      const data = await res.json();
      let formatted = Array.isArray(data)
        ? data.map((item, index) => ({
            id: item._id || index,
            slNo: index + 1,
            _id: item._id,
            pen: item.pen,
            vehicleNo: item.vehicleNo,
            subject: item.subject,
            description: item.description,
            date: item.date,
            status: item.status || 'pending',
            partsList: item.partsList || [],
            billFile: item.billFile?.data
              ? `data:${item.billFile.contentType};base64,${item.billFile.data}`
              : '',
            verifiedWorkBill: item.verifiedWorkBill?.data
              ? `data:${item.verifiedWorkBill.contentType};base64,${item.verifiedWorkBill.data}`
              : null,
            expense: item.expense || '',
            workerWage: item.workerWage || '',
            verifiedWorkBillType: item.verifiedWorkBill?.contentType || '',
          }))
        : [];
      // Sort so that 'pending' status rows are always on top
      formatted = formatted.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return 0;
      });
      setRows(formatted);
    } catch (err) {
      console.error('Error fetching repair requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMechanicRequests = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/repair-request/forwarded');
      const data = await res.json();
      setMechanicRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching mechanic requests:', err);
      setMechanicRequests([]);
    }
  }, []);





const fetchCertificates = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/repair-request/for-generating-certificate');
    const data = await res.json();
    const formatted = Array.isArray(data)
  ? data.map((item, index) => ({
      id: item._id || index,
      slNo: index + 1,
      _id: item._id,
      pen: item.pen,
      date: item.date,
      status: item.status,
      vehicleNo: item.vehicleNo,
      subject: item.subject,
      description: item.description,

       partsList: item.partsList || [],
    



finalBillFile: item.finalBillFile?.data
  ? `data:${item.finalBillFile.contentType};base64,${item.finalBillFile.data}`
  : '',

  verifiedWorkBill: item.verifiedWorkBill?.data
        ? `data:${item.verifiedWorkBill.contentType};base64,${item.verifiedWorkBill.data}`
        : null,
         additionalBill: item.status === 'sanctioned_for_work' && item.additionalBill?.data
            ? `data:${item.additionalBill.contentType};base64,${item.additionalBill.data}`
            : null,
            expense: item.expense || '',

  workerWage: item.workerWage || '',
            verifiedWorkBillType: item.verifiedWorkBill?.contentType || '',

    }))
  : [];

setCertificateRequests(formatted);

  } catch (err) {
    console.error('Error fetching certificates:', err);
    setCertificateRequests([]);
  }
};






  useEffect(() => {
    fetchRepairs();
    fetchMechanicRequests();
  }, [fetchRepairs, fetchMechanicRequests]);


 // for certificates
useEffect(() => {
  if (activeTab === 'certificates') {
    fetchCertificates();
    console.log("Fetching certificates because tab is active");
  }
}, [activeTab]);

useEffect(() => {
  if (selectedRepair?.partsList) {
    setEditedParts([...selectedRepair.partsList]);
  }
}, [selectedRepair]);

const handleEditChange = (index, field, value) => {
  const updated = [...editedParts];
  updated[index][field] = value;
  setEditedParts(updated);
};

const saveEditedParts = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/repair-request/${selectedRepair._id}/update-parts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partsList: editedParts })
    });

    if (!res.ok) throw new Error('Failed to update');

    alert('✅ Parts updated successfully');
    setEditMode(false);
  } catch (err) {
    console.error('❌ Error:', err);
    alert('Failed to save parts.');
  }
};



 const handleViewDetails = (row) => {
  setSelectedRepair(row);
  setBillDialogOpen(true);
};


  const handleClose = () => {
   
    setSelectedRepair(null);
     setDialogOpen(false);
  };

  const handleViewMechanicRequest = (row) => {
    setSelectedMechanicRequest(row);
    setMechanicDialogOpen(true);
  };

  const handleCloseMechanicDialog = () => {
    setMechanicDialogOpen(false);
    setSelectedMechanicRequest(null);
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/repair-request/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        await fetchRepairs();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Network error:', err);
    }
  };

  const forwardToMechanic = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/repair-request/${id}/forward-to-mechanic`, {
        method: 'PUT'
      });

      if (res.ok) {
        alert('Request forwarded to mechanic');
        await fetchRepairs();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to forward request');
      }
    } catch (err) {
      console.error('Error forwarding:', err);
      alert('Network error while forwarding');
    }
  };


const generateCertificates = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/api/repair-request/${id}/generate-certificates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await res.json(); // <-- get proper message

    if (res.ok) {
      alert(result.message ? '✅ ' + result.message : '✅ Certificates generated successfully');

      fetchCertificates();
    } else {
      alert('❌ Failed to generate certificates: ' + (result.message || 'Unknown error'));
    }
  } catch (err) {
    console.error(err);
    alert('❌ Server/network error occurred while generating certificate');
  }
};






  const handlePrepareEC = async (id) => {
    await generateCertificates(id);};

  const handleViewEC = (id) => {
   window.open(`http://localhost:5000/api/repair-request/${id}/view-ec`, '_blank');

  };

  const handleViewTC = (id) => {
   window.open(`http://localhost:5000/api/repair-request/${id}/view-tc`, '_blank');

  };

// newly added for verifying bill frpm repair section 

const verifyFinalBill = (entry) => {
  setVerifyEntry(entry);
  setVerifyDialogOpen(true);
};



const handleConfirmVerification = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/repair-request/${verifyEntry._id}/verify-and-send-to-mechanic`, {
      method: 'PUT'
    });

    const result = await res.json();

    if (res.ok) {
      alert('✅ Request verified and sent to Mechanic');
      setVerifyDialogOpen(false);
      fetchCertificates(); // Refresh table
    } else {
      alert(`❌ Failed to verify: ${result.message || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('Verification error:', err);
    alert('❌ Network error while verifying final bill.');
  }
};

// from mechanic - final verified bill

const fetchCompletedRequests = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/repair-request/${verifyRequest.id}/complete`);
    const data = await res.json();
    const formatted = Array.isArray(data)
      ? data.map((item, index) => ({
          id: item._id || index,
          slNo: index + 1,
          _id: item._id,
          pen: item.pen,
          vehicleNo: item.vehicleNo,
          subject: item.subject,
          description: item.description,
          date: item.date,
          verifiedWorkBill: item.verifiedWorkBill?.data
            ? `data:${item.verifiedWorkBill.contentType};base64,${item.verifiedWorkBill.data}`
            : null,
            verifiedWorkBillType: item.verifiedWorkBill?.contentType || '',
            expense: item.expense || '',

               workerWage: item.workerWage || '',
               
        }))
      : [];

    setCompletedRequests(formatted);
  } catch (err) {
    console.error('Error fetching completed requests:', err);
  }
};





useEffect(() => {
  if (activeTab === 'repair') {
    fetchCompletedRequests();
  }
}, [activeTab]);


const handleViewVerifiedBill = (row) => {
  setWorkBillData(row);
  setWorkBillDialogOpen(true);
};












  const statusStyle = (status) => {
    const pretty = status
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    const color = {
      verified: 'green',
      rejected: 'red',
      pending: 'gray',
      forwarded: 'blue',
      sent_to_MTI: 'orange',
      generating_certificates: 'purple',
      
      
    }[status] || 'black';
    return <strong style={{ color }}>{pretty}</strong>;
  };


  const columns = [
    { field: 'slNo', headerName: 'Sl. No', width: 90 },
    { field: 'vehicleNo', headerName: 'Vehicle No', width: 130 },
    { field: 'pen', headerName: 'PEN', width: 100 },
    { field: 'subject', headerName: 'Subject', width: 180 },
    {
      field: 'status',
      headerName: 'Status',
      width: 160,
      renderCell: (params) => {
        const colorMap = {
          verified: 'green',
          rejected: 'red',
          pending: 'gray',
          forwarded: 'blue',
          sent_to_MTI: 'orange',
           generating_certificates: 'purple',
           forwarded_to_repair_section: 'violet',
        };
        return (
          <strong style={{ color: colorMap[params.value] || 'gray' }}>
            {params.value.toUpperCase().replace(/_/g, ' ')}
          </strong>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 300,
      renderCell: (params) => {
        const status = params.row.status;
        const isVerified = status === 'verified';
        const isForwarded = status === 'forwarded';
        const isRejected = status === 'rejected';

        return (
          <>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleViewDetails(params.row)}
              style={{ marginRight: 8 }}
            >
              View
            </Button>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={async () => {
                await updateStatus(params.row._id, 'verified');
                await forwardToMechanic(params.row._id);
              }}
              
              disabled={params.row.status !== 'pending'  }
              
              style={{ marginRight: 4 }}
            >
              Verify
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => updateStatus(params.row._id, 'rejected')}
              disabled={isRejected}
            >
              Reject
            </Button>
          </>
        );
      }
    },

{
  field: 'verifiedWorkBill',
  headerName: 'Work Completed Bill',
  width: 200,
  renderCell: (params) => {
    const hasBill = params.row.verifiedWorkBill;
    return hasBill ? (
      <Button
        variant="outlined"
        size="small"
        onClick={() => handleViewVerifiedBill(params.row)}
      >
        View
      </Button>
    ) : (
      <span style={{ color: 'gray' }}>Not Uploaded</span>
    );
  },
},


















  ];

  return (
    <div style={{ width: '100%', ...themeStyle }}>
      <h2>
  {activeTab === 'repair'
    ? 'Repair Requests'
    : activeTab === 'mechanic'
    ? 'Mechanic Requests'
    : 'Certificates'}
</h2>


      <div style={{ marginBottom: 10 }}>
 <Button
  variant={activeTab === 'repair' ? 'contained' : 'outlined'}
  onClick={() => setActiveTab('repair')}
  style={{ marginRight: 10, position: 'relative' }}
>
  <Box display="flex" alignItems="center" position="relative">
    Repair Requests
    <Badge
      badgeContent={pendingCount}
      color="error"
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        position: 'absolute',
        top: -8,
        right: -12
      }}
    />
  </Box>
</Button>
  <Button
    variant={activeTab === 'mechanic' ? 'contained' : 'outlined'}
    onClick={() => setActiveTab('mechanic')}
    style={{ marginRight: 10, position: 'relative' }}
  >
    <Box display="flex" alignItems="center" position="relative">
      Mechanic Requests
      <Badge
        badgeContent={mechanicRequests.length}
        color="error"
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          position: 'absolute',
          top: -8,
          right: -12
        }}
      />
    </Box>
  </Button>
  <Button
    variant={activeTab === 'certificates' ? 'contained' : 'outlined'}
    onClick={() => setActiveTab('certificates')}
    style={{ position: 'relative' }}
  >
    <Box display="flex" alignItems="center" position="relative">
      Certificates
      <Badge
        badgeContent={certificateGenCount}
        color="error"
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          position: 'absolute',
          top: -8,
          right: -12
        }}
      />
    </Box>
  </Button>
</div>


     {activeTab === 'repair' ? (
  <div style={{ height: 600 }}>
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      pageSize={5}
      rowsPerPageOptions={[5, 10]}
      style={{ background: themeStyle?.background, color: themeStyle?.color }}
    />
  </div>
) : activeTab === 'mechanic' ? (
  <div style={{ height: 600 }}>
    <DataGrid
      rows={(mechanicRequests || [])
        .filter(req => req.forwardedToMechanic)
        .map((req, index) => ({
          id: req._id || index,
          slNo: index + 1,
          vehicleNo: req.vehicleNo,
          pen: req.pen,
          date: req.date,
          _id: req._id,
          partsList: req.partsList,
          workDone: req.workDone,
          subject: req.subject,
          finalBillFile: req.finalBillFile
        }))}
      columns={[
        { field: 'slNo', headerName: 'Sl No', width: 90 },
        { field: 'vehicleNo', headerName: 'Vehicle No', width: 130 },
        { field: 'pen', headerName: 'PEN', width: 100 },
        { field: 'date', headerName: 'Date', width: 140 },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 160,
          renderCell: (params) => (
            <Button variant="outlined" onClick={() => handleViewMechanicRequest(params.row)}>
              View
            </Button>
          )
        }
      ]}
      pageSize={5}
      rowsPerPageOptions={[5, 10]}
      style={{ background: themeStyle?.background, color: themeStyle?.color }}
      getRowId={(row) => row.id}
    />
  </div>
) : activeTab === 'certificates' ? (
  <div style={{ height: 600 }}>
    <DataGrid
      rows={certificateRequests
        .slice() // copy array to avoid mutating state
        .sort((a, b) => {
          const aStatus = (a.status || '').toLowerCase();
          const bStatus = (b.status || '').toLowerCase();
          if (aStatus === 'for_generating_certificate' && bStatus !== 'for_generating_certificate') return -1;
          if (aStatus !== 'for_generating_certificate' && bStatus === 'for_generating_certificate') return 1;
          return 0;
        })
        .map((cert, index) => ({
          id: cert._id || index,
          slNo: cert.slNo,
          date: cert.date,
          pen: cert.pen,
          status: cert.status,
          finalBillFile: cert.finalBillFile,
          vehicleNo: cert.vehicleNo,
          subject: cert.subject,
          description: cert.description,
          additionalBill: cert.additionalBill,
          _id: cert._id,
          partsList: cert.partsList,
          verifiedWorkBill: cert.verifiedWorkBill,
          verifiedWorkBillType: cert.verifiedWorkBillType,
          expense: cert.expense,
          workerWage: cert.workerWage
        }))}
      columns={[
        { field: 'slNo', headerName: 'Sl No', width: 90 },
        { field: 'date', headerName: 'Date', width: 140 },
        { field: 'pen', headerName: 'PEN No', width: 120 },
        {
          field: 'status',
          headerName: 'Status',
          width: 160,
          renderCell: (params) => statusStyle(params.value)
        },
        {
          field: 'viewBill',
          headerName: 'View Bill',
          width: 120,
          renderCell: (params) =>
            params.row.finalBillFile ? (
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedRepair(params.row);
                  setDialogOpen(true);
                }}
              >
                View
              </Button>
            ) : (
              <Typography variant="body2" color="textSecondary">No File</Typography>
            )
        },
        {
          field: 'certificates',
          headerName: 'Essentiality & Technical Certificate',
          width: 400,
          renderCell: (params) => (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handlePrepareEC(params.row._id)}
                disabled={params.row.status !== 'for_generating_certificate'}
              >
                Prepare EC & TC
              </Button>
              <Button
                variant="contained"
                style={{ marginLeft: 8, backgroundColor: '#1CA085', color: 'white' }}
                onClick={() => handleViewEC(params.row._id)}
                disabled={![
                  'certificate_ready', 'waiting_for_sanction', 'sanctioned_for_work',
                  'ongoing_work', 'Pending User Verification', 'work completed', 'completed'
                ].includes(params.row.status)}
              >
                View EC
              </Button>
              <Button
                variant="contained"
                style={{ marginLeft: 8, backgroundColor: '#1CA085', color: 'white' }}
                onClick={() => handleViewTC(params.row._id)}
                disabled={![
                  'certificate_ready', 'waiting_for_sanction', 'sanctioned_for_work',
                  'ongoing_work', 'Pending User Verification', 'work completed', 'completed'
                ].includes(params.row.status)}
              >
                View TC
              </Button>
            </>
          )
        },
        {
          field: 'verify',
          headerName: 'Verify Sanctioned Bill',
          width: 180,
          renderCell: (params) => (
            params.row.status === 'ongoing_work' || params.row.status === 'work_completed' || params.row.status === 'completed' ? (
              <Typography style={{ color: 'green', fontWeight: 'bold' }}>✔ Verified</Typography>
            ) : params.row.status === 'sanctioned_for_work' ? (
              <Typography variant="body2" color="textSecondary">N/A</Typography>
            ) : (
              <Typography variant="body2" color="textSecondary">N/A</Typography>
            )
          )
        }
      ]}
      pageSize={5}
      rowsPerPageOptions={[5, 10]}
      style={{ background: themeStyle?.background, color: themeStyle?.color }}
      getRowId={(row) => row.id}
    />
  </div>

) : null}


     
      <Dialog open={billDialogOpen} onClose={() => setBillDialogOpen(false)} maxWidth="md" fullWidth>
  <DialogTitle>Uploaded Bill</DialogTitle>
  <DialogContent dividers>
    {selectedRepair?.billFile ? (
      typeof selectedRepair.billFile === 'object' && selectedRepair.billFile.data ? (
        selectedRepair.billFile.contentType?.includes('pdf') ? (
          <iframe
            src={`data:${selectedRepair.billFile.contentType};base64,${selectedRepair.billFile.data}`}
            title="Bill File"
            style={{ width: '100%', height: '400px', border: 'none' }}
          />
        ) : (
          <img
            src={`data:${selectedRepair.billFile.contentType};base64,${selectedRepair.billFile.data}`}
            alt="Bill"
            style={{ maxWidth: '100%', height: 'auto', marginTop: 10 }}
          />
        )
      ) : typeof selectedRepair.billFile === 'string' ? (
        selectedRepair.billFile.includes('.pdf') || selectedRepair.billFile.startsWith('data:application/pdf') ? (
          <iframe
            src={selectedRepair.billFile}
            title="Bill File"
            style={{ width: '100%', height: '400px', border: 'none' }}
          />
        ) : (
          <img
            src={selectedRepair.billFile}
            alt="Bill"
            style={{ maxWidth: '100%', height: 'auto', marginTop: 10 }}
          />
        )
      ) : (
        <Typography color="textSecondary">Unsupported file format</Typography>
      )
    ) : (
      <Typography color="textSecondary">No Bill File Available</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setBillDialogOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>




<Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="lg">
  <DialogTitle>Repair Request Details</DialogTitle>
  <DialogContent dividers>
    {selectedRepair && (
      <>
        <Typography><strong>Vehicle No:</strong> {selectedRepair.vehicleNo}</Typography>
        <Typography><strong>PEN:</strong> {selectedRepair.pen}</Typography>
        <Typography><strong>Date:</strong> {selectedRepair.date}</Typography>
        <Typography><strong>Subject:</strong> {selectedRepair.subject}</Typography>
        <Typography><strong>Description:</strong> {selectedRepair.description}</Typography>
        <Typography><strong>Status:</strong> {selectedRepair.status}</Typography>
        <br />

        {/* ✅ Replacement Statement of Spares */}
        {Array.isArray(editedParts) && editedParts.length > 0 ? (
          <>
            <Typography variant="h6" style={{ marginTop: 16 }}>
              Replacement Statement of Spares
            </Typography>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <thead>
                <tr>
                  <th style={{ padding: 6 }}>Sl No</th>
                  <th style={{ padding: 6 }}>Item</th>
                  <th style={{ padding: 6 }}>Quantity</th>
                  <th style={{ padding: 6 }}>Previous Date</th>
                  <th style={{ padding: 6 }}>Previous MR</th>
                  <th style={{ padding: 6 }}>KM After Replace</th>
                </tr>
              </thead>
              <tbody>
                {editedParts.map((part, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 6 }}>{idx + 1}</td>
                    <td style={{ padding: 6 }}>{part.item}</td>
                    <td style={{ padding: 6 }}>{part.quantity}</td>
                    {editMode ? (
                      <>
                        <td>
                          <input
                            type="text"
                            value={part.previousDate || ''}
                            onChange={(e) => handleEditChange(idx, 'previousDate', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={part.previousMR || ''}
                            onChange={(e) => handleEditChange(idx, 'previousMR', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={part.kmAfterReplacement || ''}
                            onChange={(e) => handleEditChange(idx, 'kmAfterReplacement', e.target.value)}
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: 6 }}>{part.previousDate || '-'}</td>
                        <td style={{ padding: 6 }}>{part.previousMR || '-'}</td>
                        <td style={{ padding: 6 }}>{part.kmAfterReplacement || '-'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <Box mt={2} display="flex" gap={2}>
              {!editMode ? (
                <Button variant="outlined" onClick={() => setEditMode(true)}>✏️ Edit</Button>
              ) : (
                <>
                  <Button variant="contained" color="success" onClick={saveEditedParts}>💾 Save</Button>
                  <Button variant="outlined" onClick={() => setEditMode(false)}>Cancel</Button>
                </>
              )}
            </Box>
          </>
        ) : (
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
            No parts requested.
          </Typography>
        )}

        {/* ✅ Final Bill File Viewer */}
       {selectedRepair.finalBillFile ? (
      selectedRepair.finalBillFile.includes('pdf') ? (
        <iframe
          src={selectedRepair.finalBillFile}
          title="Final Bill"
          style={{ width: '100%', height: '400px', marginTop: 10, border: 'none' }}
        />
      ) : (
        <img
          src={selectedRepair.finalBillFile}
          alt="Final Bill"
          style={{ maxWidth: '100%', height: 'auto', marginTop: 10 }}
        />
      )
    ) : (
      <Typography color="textSecondary" sx={{ mt: 2 }}>
        No final bill uploaded
      </Typography>
    )}

        
      </>
    )}
  </DialogContent>
</Dialog>



















<Dialog
  open={workBillDialogOpen}
  onClose={() => setWorkBillDialogOpen(false)}
  maxWidth={false}
  PaperProps={{
    style: {
      width: '70%',
      maxWidth: '70%',
      height: 'auto',
    },
  }}
>
  <DialogTitle>Verified Work Bill & Expense</DialogTitle>
  <DialogContent dividers>
    <Typography sx={{ mt: 2 }}>
  <strong>Total Expense:</strong> ₹{workBillData?.expense?.toString().trim() || 'N/A'}
</Typography>


<Typography sx={{ mt: 2 }}>
  <strong>Worker Wage:</strong> ₹{workBillData?.workerWage?.toString().trim() || 'N/A'}
</Typography>



    {workBillData?.verifiedWorkBill ? (
      workBillData.verifiedWorkBillType?.includes('pdf') ||
      workBillData.verifiedWorkBill.startsWith('data:application/pdf') ? (
        <iframe
          src={workBillData.verifiedWorkBill}
          title="Verified Work Bill PDF"
          width="100%"
          height="500px"
          style={{ border: 'none' }}
        />
      ) : (
        <img
          src={workBillData.verifiedWorkBill}
          alt="Verified Work Bill"
          style={{
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
          }}
        />
      )
    ) : (
      <Typography color="textSecondary">No bill uploaded.</Typography>
    )}






  </DialogContent>
  <DialogActions>
    {workBillData?.verifiedWorkBill && (
      <Button
        variant="outlined"
        onClick={() => {
          const link = document.createElement('a');
          link.href = workBillData.verifiedWorkBill;
          link.download = `Verified_Work_Bill.${
            workBillData.verifiedWorkBillType?.includes('pdf') ||
            workBillData.verifiedWorkBill.startsWith('data:application/pdf')
              ? 'pdf'
              : 'jpg'
          }`;
          link.click();
        }}
      >
        Download
      </Button>
    )}
    <Button onClick={() => setWorkBillDialogOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>





      {/* Mechanic Request Dialog */}
      <Dialog open={mechanicDialogOpen} onClose={handleCloseMechanicDialog} fullWidth maxWidth="md">
        <DialogTitle>Mechanic Request Details</DialogTitle>
        <DialogContent>
          {selectedMechanicRequest && selectedMechanicRequest.partsList?.length > 0 ? (
            <>
              <Typography><strong>Vehicle No:</strong> {selectedMechanicRequest.vehicleNo}</Typography>
              <Typography><strong>Work Done:</strong> {selectedMechanicRequest.workDone}</Typography>
              <Typography><strong>Date:</strong> {selectedMechanicRequest.date}</Typography>
              <Typography><strong>Subject:</strong> {selectedMechanicRequest.subject}</Typography>

              <Typography variant="h6" style={{ marginTop: '16px' }}>Parts Required</Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Sl No</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Item</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMechanicRequest.partsList.map((part, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '6px' }}>{idx + 1}</td>
                      <td style={{ padding: '6px' }}>{part.item}</td>
                      <td style={{ padding: '6px' }}>{part.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedMechanicRequest.finalBillFile ? (
                <>
                  <Typography variant="h6" style={{ marginTop: '16px' }}>Uploaded Bill</Typography>
                  {selectedMechanicRequest.finalBillFile.contentType.includes('pdf') ? (
                    <iframe
                      src={`data:${selectedMechanicRequest.finalBillFile.contentType};base64,${selectedMechanicRequest.finalBillFile.data}`}
                      title="Bill Preview"
                      style={{
                        width: '100%',
                        maxHeight: '500px',
                        border: '1px solid #ccc',
                        borderRadius: 4
                      }}
                    />
                  ) : (
                    <img
                      src={`data:${selectedMechanicRequest.finalBillFile.contentType};base64,${selectedMechanicRequest.finalBillFile.data}`}
                      alt="Bill"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '500px',
                        display: 'block',
                        margin: 'auto',
                        objectFit: 'contain',
                        borderRadius: 6,
                        border: '1px solid #ddd'
                      }}
                    />
                  )}
                </>
              ) : (
                <Typography color="textSecondary">No Bill Uploaded</Typography>
              )}
            </>
          ) : (
            <Typography>No mechanic request details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMechanicDialog}>Close</Button>
          <Button
            variant="contained"
            color="success"
            onClick={async () => {
              try {
                const res = await fetch(`http://localhost:5000/api/repair-request/${selectedMechanicRequest._id}/forward-to-repair`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ id: selectedMechanicRequest._id })
                });

                const result = await res.json();

                if (res.ok) {
                  alert('✅ Request forwarded to Repair Section');
                  fetchRepairs();
                  fetchMechanicRequests();
                  handleCloseMechanicDialog();
                } else {
                  alert(`❌ Failed: ${result.message || 'Unable to forward request'}`);
                }
              } catch (err) {
                console.error('Fetch error:', err);
                alert('❌ Error while forwarding the request. Please try again.');
              }
            }}
          >
            Forward to Repair Section
          </Button>
        </DialogActions>
      </Dialog>



      {/* Verify Dialog for sanctioned_for_work */}
<Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)} maxWidth="md" fullWidth>
  <DialogTitle>Verify and Send to Mechanic</DialogTitle>
  <DialogContent dividers>
    {verifyEntry && (
      <>
        <Typography><strong>PEN:</strong> {verifyEntry.pen}</Typography>
        <Typography><strong>Date:</strong> {verifyEntry.date}</Typography>
        <Typography><strong>Status:</strong> {verifyEntry.status}</Typography>

        {verifyEntry?.additionalBill ? (
  <iframe
    src={verifyEntry.additionalBill}
    title="Additional Bill"
    style={{ width: '100%', height: '400px', marginTop: 10 }}
  />
) : (
  <Typography color="textSecondary" sx={{ mt: 2 }}>
    No additional bill uploaded
  </Typography>
)}

      </>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleConfirmVerification} color="success" variant="contained">
      Verified
    </Button>
    <Button onClick={() => setVerifyDialogOpen(false)} variant="outlined">
      Cancel
    </Button>
  </DialogActions>
</Dialog>



    </div>
  );
};

export default AdminRepairTable;