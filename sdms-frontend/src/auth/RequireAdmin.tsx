import { Box, Container, Typography, Button } from '@mui/material';
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import CustomSkeleton from '@/components/common/CustomSkeleton';

import { snackbar } from '@/utils/snackbar';

import { useAuth } from './AuthContext';

export default function RequireAdmin() {
  const { admin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();


  const isAuthorized = admin && ['ADMIN', 'STAFF'].includes(admin.role?.toUpperCase());

  useEffect(() => {
    if (admin && !isAuthorized) {
      snackbar.error('Bạn không có quyền truy cập trang quản trị!');

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

      </Box>
    );
  }

  return <Outlet />;
}
