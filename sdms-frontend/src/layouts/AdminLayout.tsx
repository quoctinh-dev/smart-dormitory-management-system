import { Box, CssBaseline, Toolbar } from '@mui/material';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import AdminAppBar from './admin/AdminAppBar';
import AdminSidebar from './admin/AdminSidebar';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <CssBaseline />

      <AdminAppBar onMobileNavOpen={handleDrawerToggle} />

      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar sx={{ height: 72 }} />
        <Outlet />
      </Box>
    </Box>
  );
}
