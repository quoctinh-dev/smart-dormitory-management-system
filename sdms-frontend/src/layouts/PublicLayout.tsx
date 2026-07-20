import CloseIcon from '@mui/icons-material/Close';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Avatar,
  Stack,
  Link,
  CssBaseline,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { text: 'Trang chủ', path: '/' },
  { text: 'Đăng ký lưu trú', path: '/register' },
  { text: 'Tra cứu hồ sơ', path: '/status' },
  { text: 'Kích hoạt tài khoản', path: '/activate-account' },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative',
        backgroundColor: '#f8fafc',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: '-10%',
          left: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        },
        // Nền hiệu ứng chuyển màu phía dưới
        '&::after': {
          content: '""',
          position: 'fixed',
          bottom: '-10%',
          right: '-10%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        },
      }}
    >
      <CssBaseline />

      {/* NAVBAR (AURORA GLASSMORPHISM) */}
      <Box sx={{ position: 'relative', zIndex: 1100, pt: { xs: 2, md: 2 }, px: { xs: 2, md: 3 } }}>
        <AppBar
          elevation={0}
          position="static"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 70 }}>
              {/* LOGO */}
              <Stack
                component={RouterLink}
                to="/"
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ textDecoration: 'none' }}
              >
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                    width: 40,
                    height: 40,
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                  }}
                >
                  S
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  STU Dorm
                </Typography>
              </Stack>

              {/* DESKTOP NAV MENU */}
              <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
                {NAV_LINKS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.text}
                      component={RouterLink}
                      to={item.path}
                      underline="none"
                      variant="body2"
                      sx={{
                        px: 2.5,
                        py: 1,
                        borderRadius: '12px',
                        fontWeight: isActive ? 700 : 600,
                        color: isActive ? 'primary.main' : 'text.secondary',
                        position: 'relative',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          color: 'primary.main',
                          bgcolor: 'rgba(14, 165, 233, 0.06)',
                        },
                        ...(isActive && {
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 4,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 20,
                            height: 3,
                            borderRadius: 2,
                            backgroundColor: 'primary.main',
                          },
                        }),
                      }}
                    >
                      {item.text}
                    </Link>
                  );
                })}
              </Stack>

              {/* MOBILE MENU BUTTON */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ display: { md: 'none' }, color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </Container>
        </AppBar>
      </Box>

      {/* MOBILE DRAWER NAV */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 280, bgcolor: 'background.paper' } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ px: 2 }}>
          {NAV_LINKS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: isActive ? 'action.selected' : 'transparent',
                    color: isActive ? 'primary.main' : 'text.primary',
                  }}
                >
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, variant: 'body1' }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* MAIN CONTENT CONTAINER */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* FOOTER */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#0f172a',
          color: '#94a3b8',
          pt: 8,
          pb: 6,
          mt: 'auto',
          borderTop: '1px solid',
          borderColor: '#1e293b',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={6}
            sx={{ mb: 6 }}
          >
            {/* Cột trái: Giới thiệu */}
            <Box sx={{ maxWidth: 400 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2 }}>
                Ký túc xá STU
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 3 }}>
                Giải pháp đăng ký trực tuyến nhanh chóng, minh bạch thuộc Trường Đại học Công nghệ Sài Gòn.
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <LocationOnOutlinedIcon sx={{ color: 'primary.light', fontSize: 20, mt: 0.3 }} />
                <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                  180 Cao Lỗ, Phường 4, Quận 8, TP.HCM
                </Typography>
              </Stack>
            </Box>

            {/* Các cột phải: Menu & Support */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 5, sm: 10 }}>
              {/* Cột giữa: Liên kết nhanh */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: '#f8fafc', mb: 2.5, letterSpacing: '0.5px' }}
                >
                  LIÊN KẾT NHANH
                </Typography>
                <Stack direction="column" spacing={2}>
                  {NAV_LINKS.map((item) => (
                    <Link
                      key={item.text}
                      component={RouterLink}
                      to={item.path}
                      color="inherit"
                      underline="none"
                      variant="body2"
                      sx={{
                        transition: 'color 0.15s ease',
                        '&:hover': { color: '#f8fafc' },
                      }}
                    >
                      {item.text}
                    </Link>
                  ))}
                </Stack>
              </Box>

              {/* Cột phải: Thông tin liên hệ */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: '#f8fafc', mb: 2.5, letterSpacing: '0.5px' }}
                >
                  THÔNG TIN HỖ TRỢ
                </Typography>
                <Stack direction="column" spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <PhoneOutlinedIcon sx={{ color: 'primary.light', fontSize: 18 }} />
                    <Typography variant="body2">
                      Hotline: <strong style={{ color: '#fff' }}>0902.992.306</strong>
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <LocalPhoneOutlinedIcon sx={{ color: 'primary.light', fontSize: 18, mt: 0.3 }} />
                    <Typography variant="body2">Phòng hành chính: (028) 38.505.520</Typography>
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <EmailOutlinedIcon sx={{ color: 'primary.light', fontSize: 18 }} />
                    <Typography variant="body2">
                      <Link
                        href="mailto:ktx@stu.edu.vn"
                        color="inherit"
                        underline="hover"
                        sx={{ '&:hover': { color: '#fff' } }}
                      >
                        ktx@stu.edu.vn
                      </Link>
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
