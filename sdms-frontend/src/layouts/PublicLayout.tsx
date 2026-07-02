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
} from '@mui/material';
import { Outlet, Link as RouterLink } from 'react-router-dom';

const FOOTER_LINKS = [
  { text: 'Trang chủ', path: '/' },
  { text: 'Đăng ký lưu trú', path: '/register' },
  { text: 'Tra cứu hồ sơ', path: '/status' },
  { text: 'Kích hoạt tài khoản', path: '/activate-account' },
];

export default function PublicLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />

      {/* NAVBAR */}
      <AppBar
        elevation={0}
        sx={{
          position: 'sticky',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Stack
              component={RouterLink}
              to="/"
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ textDecoration: 'none', color: 'text.primary' }}
            >
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>K</Avatar>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, display: { xs: 'none', sm: 'block' } }}
              >
                KTX portal
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} />
          </Toolbar>
        </Container>
      </AppBar>

      {/* MAIN CONTENT */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* FOOTER */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'grey.400',
          pt: 8,
          pb: 4,
          mt: 'auto',
          borderTop: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <Container>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={6}
            sx={{ mb: 6 }}
          >
            <Box sx={{ maxWidth: 400 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'common.white', mb: 1 }}>
                Ký túc xá STU
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 2 }}>
                Giải pháp đăng ký trực tuyến nhanh chóng, minh bạch thuộc hệ sinh thái Đại học Công
                nghệ Sài Gòn.
              </Typography>
              <Typography variant="body2" sx={{ color: 'common.white' }}>
                📍 180 Cao Lỗ, Phường 4, Quận 8, TP.HCM
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={8}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 'bold', color: 'common.white', mb: 2 }}
                >
                  Liên kết nhanh
                </Typography>
                <Stack spacing={1.5}>
                  {FOOTER_LINKS.map((item) => (
                    <Link
                      key={item.text}
                      component={RouterLink}
                      to={item.path}
                      color="inherit"
                      underline="hover"
                      variant="body2"
                    >
                      {item.text}
                    </Link>
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 'bold', color: 'common.white', mb: 2 }}
                >
                  Thông tin hỗ trợ
                </Typography>
                <Stack spacing={1.5}>
                  <Typography variant="body2">
                    📞 Hotline: <strong>0902.992.306</strong>
                  </Typography>
                  <Typography variant="body2">☎️ Phòng hành chính: (028) 38.505.520</Typography>
                  <Typography variant="body2">✉️ Email: ktx@stu.edu.vn</Typography>
                </Stack>
              </Box>
            </Stack>
          </Stack>

          <Box
            sx={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              pt: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption">
              © {new Date().getFullYear()} Bản quyền thuộc về ban quản lý ký túc xá - Trường Đại học
              Công nghệ Sài Gòn (STU).
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
