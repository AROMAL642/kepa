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
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BadgeIcon from '@mui/icons-material/Badge';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import InfoIcon from '@mui/icons-material/Info';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import InventoryIcon from '@mui/icons-material/Inventory';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';

const UserQuickAccess = ({ onSelectTab, expiredCertCount }) => {
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
    { label: 'Profile', icon: <PersonIcon />, tab: 'profile' },
    { label: 'Fuel', icon: <LocalGasStationIcon />, tab: 'fuel' },
    { label: 'Repair Request', icon: <MiscellaneousServicesIcon />, tab: 'repair' },
    { label: 'Track Repair', icon: <TrackChangesIcon />, tab: 'trackrepair' },
    { label: 'Movement', icon: <DirectionsRunIcon />, tab: 'movement' },
    { label: 'Eye Test', icon: <VisibilityIcon />, tab: 'eyetest' },
    { label: 'License', icon: <BadgeIcon />, tab: 'license' },
    { label: 'Accident', icon: <ReportProblemIcon />, tab: 'accident' },
    { label: 'Vehicle Details', icon: <InfoIcon />, tab: 'vehicle details' },
   
   { label: 'Stocks', icon: <InventoryIcon />, tab: 'stocks' },
    { label: 'Notifications', icon: <NotificationsIcon />, tab: 'notifications' },
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

export default UserQuickAccess;
