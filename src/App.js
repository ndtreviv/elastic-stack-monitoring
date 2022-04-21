import React, { useState } from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { TimeRangeSelector } from './components/TimeRangeSelector';
import { Clusters } from './components/Clusters';
import { Cluster } from './components/Cluster';
import Index from './components/Index';
import './App.css';
import { resolveRange } from './utils/date-utils';
import rangeContext from './contexts/rangeContext';

const pages = [];
const APP_NAME = 'Elastic Stack Monitoring';

export default function App () {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [fetchRange, setFetchRange] = useState(resolveRange({ from: '-1h', to: 'now', label: 'Last 1 hour', type: 'quick-selection' }));

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <>
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position='static'>
            <Toolbar disableGutters>
              <Typography
                variant='h6'
                noWrap
                component='div'
                sx={{ mr: 2, ml: 1, display: { xs: 'none', md: 'flex' } }}
              >
                <MonitorHeartIcon sx={{ marginRight: '4px' }} fontSize='large' />
                {APP_NAME}
              </Typography>

              <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                  size='large'
                  aria-label='account of current user'
                  aria-controls='menu-appbar'
                  aria-haspopup='true'
                  onClick={handleOpenNavMenu}
                  color='inherit'
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id='menu-appbar'
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: { xs: 'block', md: 'none' }
                  }}
                >
                  {pages.map((page) => (
                    <MenuItem key={page.label} component={Link} to={page.uri} onClick={handleCloseNavMenu}>
                      <Typography textAlign='center'>{page.label}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
              <Typography
                variant='h6'
                noWrap
                component='div'
                sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
              >
                <MonitorHeartIcon sx={{ marginRight: '4px' }} fontSize='large' />
                {APP_NAME}
              </Typography>
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                {pages.map((page) => (
                  <Button
                    component={Link}
                    to={page.uri}
                    key={page.label}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    {page.label}
                  </Button>
                ))}
              </Box>

            </Toolbar>
          </AppBar>
        </Box>

        <Box>

          <rangeContext.Provider value={{ fetchRange, setFetchRange }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TimeRangeSelector sx={{ margin: 2 }} />
            </Box>

            <Routes>
              <Route path='/clusters' element={<Clusters />} />
              <Route path='/clusters/:clusterUuid::clusterName' element={<Cluster />} />
              <Route path='/clusters/:clusterUuid::clusterName/nodes/:nodeUuid::nodeName' element={<Cluster />} />
              <Route path='/clusters/:clusterUuid::clusterName/indices/:index' element={<Index />} />
              <Route
                path='*'
                element={<Navigate to='/clusters' />}
              />
            </Routes>
          </rangeContext.Provider>
        </Box>
      </Router>
    </>
  );
}
