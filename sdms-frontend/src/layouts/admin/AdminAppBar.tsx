import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';

import NotificationBell from '@/components/common/NotificationBell';
import { useAuth } from '@/providers/AuthProvider';

interface AdminAppBarProps {
  onMobileNavOpen: () => void;
}

export default function AdminAppBar({ onMobileNavOpen }: AdminAppBarProps) {
  const { logout } = useAuth();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', height: 72 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMobileNavOpen}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              letterSpacing: '-0.5px',
            }}
          >
            SDMS Admin
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationBell />
          <Button
            color="error"
            variant="text"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{ fontWeight: 'bold' }}
          >
            Đăng xuất
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
