import { Box, Container, Typography, Button } from '@mui/material';
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { snackbar } from '@/helpers/snackbar';
import { useAuth } from '@/providers/AuthProvider';

export default function RequireAdmin() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthorized = user && ['ADMIN', 'STAFF'].includes(user.role?.toUpperCase() || '');

  useEffect(() => {
    if (user && !isAuthorized) {
      snackbar.error('Bạn không có quyền truy cập trang quản trị!');

      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [user, isAuthorized, navigate]);

  if (loading) {
    return <CustomSkeleton type="dashboard" count={1} />;
  }

  if (!user || !['ADMIN', 'STAFF'].includes(user.role?.toUpperCase() || '')) {
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
