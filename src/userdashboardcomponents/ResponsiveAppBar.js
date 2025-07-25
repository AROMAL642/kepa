import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';

const settings = ['Profile', 'Dashboard', 'Logout'];
const DRAWER_WIDTH = 240;

function ResponsiveAppBar({
  photo,
  name,
  isDrawerOpen,
  onDrawerToggle,
  onSelectTab,
  pendingRequestCount = 0,
  expiredCertCount = 0,
}) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  const handleCloseUserMenu = (setting) => {
    setAnchorElUser(null);
    if (setting === 'Logout') {
      localStorage.clear();
      navigate('/');
    } else if (onSelectTab) {
  const tabKey = setting === 'Dashboard' ? 'quickaccess' : setting.toLowerCase();
  onSelectTab(tabKey);
}

  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(96% - ${isDrawerOpen ? DRAWER_WIDTH : 0}px)`,
        ml: `${isDrawerOpen ? DRAWER_WIDTH : 0}px`,
        transition: 'all 1s ease',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ px: 2 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2, display: { md: 'inline-flex' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#"
            sx={{
              mr: 2,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              display: { xs: 'none', md: 'flex' }
            }}
          >
            KEPA
          </Typography>

          {/* Mobile View */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <MenuItem onClick={() => { handleCloseNavMenu(); onSelectTab('notifications'); }}>
                <Typography textAlign="center">
                  Requests <Badge badgeContent={pendingRequestCount} color="error" sx={{ ml: 1 }} />
                </Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseNavMenu(); onSelectTab('notifications'); }}>
                <Typography textAlign="center">
                  Notifications
                  {expiredCertCount > 0 && (
                    <Badge badgeContent={expiredCertCount} color="error" sx={{ ml: 1 }} />
                  )}
                </Typography>
              </MenuItem>
            </Menu>
          </Box>

          {/* Desktop View */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Badge
                badgeContent={pendingRequestCount}
                color="error"
                sx={{ position: 'absolute', top: -5, right: -10 }}
              />
              <Button onClick={() => onSelectTab('notifications')} sx={{ my: 2, color: 'white', pl: 4 }}>
                Requests
              </Button>
            </Box>

           <Box sx={{ position: 'relative' }}>
  <Button
    onClick={() => onSelectTab('notifications')}
    sx={{ my: 2, color: 'white', pl: 4 }}
  >
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      Notifications
      {expiredCertCount > 0 && (
        <Badge
          badgeContent={expiredCertCount}
          color="error"
          sx={{
            position: 'absolute',
            top: -8,
            right: -16,
          }}
        />
      )}
    </Box>
  </Button>
</Box>

          </Box>

          {/* Avatar and User Menu */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ color: 'white' }}>
                  {name || 'Admin'}
                </Typography>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Admin Photo" src={photo || 'https://via.placeholder.com/150'} />
                </IconButton>
              </Box>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={() => setAnchorElUser(null)}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={() => handleCloseUserMenu(setting)}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
