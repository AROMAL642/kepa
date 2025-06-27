import React, { useEffect, useState, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const RepairAdminTable = ({ themeStyle }) => {
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

// Define this map once at the top of your component/file
const STATUS_ORDER = {
  
  ongoing_work: 1,
  for_generating_certificate: 2,
  certificate_ready: 3,
  Pending_User_Verfication: 4,
  work_completed: 5,
  completed: 6

};

  
 
  const fetchRepairs = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/repair-request');
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
      billFile: item.finalBillFile?.data
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





  const handleViewDetails = (row) => {
     console.log('Selected Repair:', row);
    setSelectedRepair(row);
    setDialogOpen(true);
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
    await generateCertificates(id);
  };

  const handlePrepareTC = async (id) => {
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
              disabled={isVerified || isForwarded}
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
    style={{ marginRight: 10 }}
  >
    Repair Requests
  </Button>
  <Button
    variant={activeTab === 'mechanic' ? 'contained' : 'outlined'}
    onClick={() => setActiveTab('mechanic')}
    style={{ marginRight: 10 }}
  >
    Mechanic Requests
  </Button>
  <Button
    variant={activeTab === 'certificates' ? 'contained' : 'outlined'}
    onClick={() => setActiveTab('certificates')}
  >
    Certificates
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
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>Sl No</th>
        <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>Vehicle No</th>
        <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>PEN</th>
        <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>Date</th>
        <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {(mechanicRequests || [])
        .filter(req => req.forwardedToMechanic)
        .map((req, index) => (
          <tr key={req._id}>
            <td style={{ padding: 10 }}>{index + 1}</td>
           <td style={{ padding: 10 }}>{req.vehicleNo}</td>
            <td style={{ padding: 10 }}>{req.pen}</td>
            <td style={{ padding: 10 }}>{req.date}</td>
            <td style={{ padding: 10 }}>
              <Button variant="outlined" onClick={() => handleViewMechanicRequest(req)}>View</Button>
            </td>
          </tr>
        ))}
    </tbody>
  </table>
) : activeTab === 'certificates' ? (
  

  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
  <thead>
    <tr>
      <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>Sl No</th>
      <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>Date</th>
      <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>PEN No</th>
      <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>Status</th>
      <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>View Bill</th>
      <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>Essentiality & Technical Certificate</th>

<th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>Verify Sanctioned Bill</th>

    </tr>
  </thead>
  <tbody>
    {certificateRequests.map((cert, index) => (
      <tr key={cert._id}>
        <td style={{ padding: 10 }}>{cert.slNo}</td>
        <td style={{ padding: 10 }}>{cert.date}</td>
        <td style={{ padding: 10 }}>{cert.pen}</td>
        <td style={{ padding: 10 }}>{statusStyle(cert.status)}</td>
        
        <td style={{ padding: 10 }}>
         {cert.billFile ? (
  <Button
    variant="outlined"
    onClick={() => {
      setSelectedRepair(cert);
      setDialogOpen(true);
    }}
  >
    View
  </Button>
) : (
  <Typography variant="body2" color="textSecondary">No File</Typography>
)}

        </td>
        {/* EC column */}
<td style={{ padding: 10 }}>
  <Button
    variant="contained"
    color="primary"
    onClick={() => handlePrepareEC(cert._id)}
    disabled={cert.status !== 'for_generating_certificate'}
  >
    Prepare EC & TC
  </Button>
  <Button
    variant="outlined"
    style={{ marginLeft: 8 }}
    onClick={() => handleViewEC(cert._id)}
    disabled={
      !['certificate_ready', 'waiting_for_sanction', 'sanctioned_for_work' , 'ongoing_work','Pending User Verification' , 'work complete' , 'completed'].includes(cert.status)
    }
  >
    View EC
  </Button>
  <Button
    variant="outlined"
    style={{ marginLeft: 8 }}
    onClick={() => handleViewTC(cert._id)}
    disabled={
      !['certificate_ready', 'waiting_for_sanction', 'sanctioned_for_work' , 'ongoing_work', ,'Pending User Verification' , 'work complete' , 'completed'].includes(cert.status)
    }
  >
    View TC
  </Button>
</td>



{/* VERIFY column */}
<td style={{ padding: 10 }}>
  {STATUS_ORDER[cert.status] === STATUS_ORDER['sanctioned_for_work'] ? (
    <Button
      variant="outlined"
      onClick={() => {
        setVerifyEntry(cert);
        setVerifyDialogOpen(true);
      }}
    >
      Verify
    </Button>
  ) : STATUS_ORDER[cert.status] >= STATUS_ORDER['ongoing_work'] ? (
    <Typography style={{ color: 'green', fontWeight: 'bold' }}>✔ Verified</Typography>
  ) : (
    <Typography variant="body2" color="textSecondary">N/A</Typography>
  )}
</td>







        
      </tr>
    ))}
  </tbody>
</table>

) : null}


      {/* Repair Request Dialog */}
      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Repair Request Details</DialogTitle>
        <DialogContent>
          {selectedRepair && (
            <>
              <Typography><strong>Vehicle No:</strong> {selectedRepair.vehicleNo}</Typography>
              <Typography><strong>PEN:</strong> {selectedRepair.pen}</Typography>
              <Typography><strong>Date:</strong> {selectedRepair.date}</Typography>
              <Typography><strong>Subject:</strong> {selectedRepair.subject}</Typography>
              <Typography><strong>Description:</strong> {selectedRepair.description}</Typography>
              <Typography><strong>Status:</strong> {selectedRepair.status}</Typography>
              <br />
              {selectedRepair.billFile ? (
                <iframe
                  src={selectedRepair.billFile}
                  title="Bill File"
                  style={{ width: '100%', height: '400px', border: 'none' }}
                />
              ) : (
                <Typography color="textSecondary">No Bill File Available</Typography>
              )}
              
{Array.isArray(selectedRepair?.partsList) && selectedRepair.partsList.length > 0 ? (
  <>
    <Typography variant="h6" style={{ marginTop: 16 }}>Parts Requested</Typography>
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
      <thead>
        <tr>
          <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Sl No</th>
          <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Item</th>
          <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Quantity</th>
        </tr>
      </thead>
      <tbody>
        {selectedRepair.partsList.map((part, idx) => (
          <tr key={idx}>
            <td style={{ padding: '6px' }}>{idx + 1}</td>
            <td style={{ padding: '6px' }}>{part.item || '-'}</td>
            <td style={{ padding: '6px' }}>{part.quantity || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
) : (
  <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
    No parts requested.
  </Typography>
)}



            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">Close</Button>
        </DialogActions>
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
<Typography sx={{ mt: 2 }}>
  <strong>Expense:</strong> ₹{workBillData?.expense?.toString().trim() || 'N/A'}
</Typography>


<Typography sx={{ mt: 2 }}>
  <strong>Worker Wage:</strong> ₹{workBillData?.workerWage?.toString().trim() || 'N/A'}
</Typography>





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

export default RepairAdminTable;
