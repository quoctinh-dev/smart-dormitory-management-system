import { MailOutline } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useForgotPassword } from '@/hooks/useForgotPassword';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { email, setEmail, loading, error, success, handleSubmit } = useForgotPassword();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(126,34,206,0.3) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(60px)',
          zIndex: -1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(60px)',
          zIndex: -1,
        },
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 460,
          mx: 'auto',
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                p: 1.5,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 1.5,
                boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
              }}
            >
              <MailOutline />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Khôi phục mật khẩu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Vui lòng nhập email đã đăng ký. Hệ thống sẽ gửi một liên kết an toàn để bạn đặt lại
              mật khẩu mới.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Yêu cầu đã được xử lý. Vui lòng kiểm tra hộp thư email (bao gồm cả thư rác) để lấy
                liên kết khôi phục.
              </Alert>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/admin/login')}
                sx={{ borderRadius: 3, py: 1 }}
              >
                Quay lại Đăng nhập
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Địa chỉ Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.2,
                  borderRadius: 3,
                  boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Gửi yêu cầu'}
              </Button>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="text"
                  color="secondary"
                  onClick={() => navigate('/admin/login')}
                  sx={{ textTransform: 'none', fontWeight: 'bold' }}
                >
                  Quay lại Đăng nhập
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default ForgotPasswordPage;
