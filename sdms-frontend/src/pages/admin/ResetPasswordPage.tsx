import { Visibility, VisibilityOff, LockReset } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useResetPassword } from '@/hooks/useResetPassword';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    loading,
    error,
    success,
    toggleShowPassword,
    handleSubmit,
  } = useResetPassword();

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
          background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(255,255,255,0) 70%)',
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
                bgcolor: 'success.main',
                color: 'success.contrastText',
                p: 1.5,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 1.5,
                boxShadow: '0 4px 14px 0 rgba(16,185,129,0.39)',
              }}
            >
              <LockReset />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Đặt lại mật khẩu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
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
                Mật khẩu của bạn đã được thay đổi thành công!
              </Alert>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate('/admin/login')}
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  boxShadow: '0 4px 14px 0 rgba(16,185,129,0.39)',
                  bgcolor: 'success.main',
                  '&:hover': { bgcolor: 'success.dark' },
                }}
              >
                Đăng nhập ngay
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mật khẩu mới"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={toggleShowPassword} edge="end" disabled={loading}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Lưu mật khẩu mới'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default ResetPasswordPage;
