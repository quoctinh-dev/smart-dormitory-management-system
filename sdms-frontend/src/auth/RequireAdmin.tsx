import { Box, Snackbar, Alert, Container, Typography, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import CustomSkeleton from '@/components/common/CustomSkeleton';

import { useAuth } from './AuthContext';

export default function RequireAdmin() {
  const { admin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const isAuthorized =
    admin && ['ADMIN', 'STAFF', 'Admin', 'SuperAdmin'].includes(admin.role?.toUpperCase());

  useEffect(() => {
    if (admin && !isAuthorized) {
      setOpenSnackbar(true);

      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [admin, isAuthorized, navigate]);

  if (loading) {
    return <CustomSkeleton type="dashboard" count={1} />;
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="xs">
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'error.main' }}>
            Từ chối truy cập!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tài khoản của bạn không có đặc quyền truy cập khu vực quản trị. Hệ thống sẽ tự động đưa
            bạn quay lại Trang chủ.
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/', { replace: true })}>
            Quay lại trang chủ ngay
          </Button>
        </Container>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
            Bạn không có quyền truy cập trang quản trị!
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return <Outlet />;
}
