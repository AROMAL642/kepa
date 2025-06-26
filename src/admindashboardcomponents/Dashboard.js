import React from 'react';
import {
  Grid,
  Button,
  Badge,
  Typography,
  Box,
  useMediaQuery
} from '@mui/material';

import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PrintIcon from '@mui/icons-material/Print';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Dashboard = ({
  onSelectTab,
  pendingFuelCount,
  repairPendingCount,
  pendingAccidentCount,
  pendingCount,
  expiredCertCount
}) => {
  const isMobile = useMediaQuery('(max-width:600px)');

  const chipStyle = {
    minHeight: isMobile ? 60 : 80,
    width: '100%',
    fontSize: isMobile ? '0.85rem' : '1.05rem',
    justifyContent: 'flex-start',
    padding: '10px 20px',
    textTransform: 'none',
    backgroundColor: 'transparent',
    color: '#1976d2',
    border: '2px solid #1976d2',
    borderRadius: '30px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  };

  const buttons = [
    { label: 'Fuel', icon: <LocalGasStationIcon />, tab: 'Fuel', count: pendingFuelCount },
    { label: 'Movement Register', icon: <DirectionsCarIcon />, tab: 'Movement' },
    { label: 'Repair Reports', icon: <BuildIcon />, tab: 'Repair', count: repairPendingCount },
    { label: 'Accident Details', icon: <ReportProblemIcon />, tab: 'Accident', count: pendingAccidentCount },
    { label: 'Vehicle', icon: <DirectionsCarIcon />, tab: 'VehicleDetails', count: expiredCertCount },
    { label: 'Non Verified Users', icon: <PersonSearchIcon />, tab: 'Request', count: pendingCount },
    { label: 'Stock', icon: <InventoryIcon />, tab: 'stocks' },
    { label: 'Users Details', icon: <PeopleIcon />, tab: 'VerifiedUsersTable' },
    { label: 'Add Users', icon: <AddCircleOutlineIcon />, tab: 'AddUser' },
    { label: 'View/Print Registers', icon: <PrintIcon />, tab: 'PrintRegisters' },
    { label: 'Trainees Details', icon: <SchoolIcon />, tab: 'trainees' },
    { label: 'Purchase', icon: <ShoppingCartIcon />, tab: 'Purchases' }
  ];

  return (
    <Box p={isMobile ? 2 : 4}>
      <Typography variant={isMobile ? 'h5' : 'h4'} mb={4} textAlign="center">
        Quick Access
      </Typography>

      <Grid container spacing={3}>
        {buttons.map(({ label, icon, tab, count }) => (
          <Grid item xs={12} sm={6} md={4} key={tab}>
            <Badge
              badgeContent={count > 0 ? count : null}
              color="error"
              overlap="circular"
            >
              <Button
                variant="outlined"
                style={chipStyle}
                onClick={() => onSelectTab(tab)}
                startIcon={icon}
              >
                {label}
              </Button>
            </Badge>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
