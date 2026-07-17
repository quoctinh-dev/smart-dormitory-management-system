import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
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

import { useLogin } from '@/hooks/useLogin';

type LoginPageProps = Record<string, never>;

const LoginPage: React.FC<LoginPageProps> = () => {
  const navigate = useNavigate();

  const { formData, showPassword, loading, error, handleChange, toggleShowPassword, handleSubmit } =
    useLogin();

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    handleSubmit(event);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header / Icon */}
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
              }}
            >
              <LockOutlined />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              Hệ thống Quản trị KTX
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, textAlign: 'center' }}
            >
              Đăng nhập để tiếp tục vào phân hệ Admin
            </Typography>
          </Box>

          {/* Hiển thị thông báo lỗi */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {String(error)}
            </Alert>
          )}

          {/* Form nhập liệu */}
          <Box component="form" onSubmit={onFormSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="usernameOrEmail"
              label="Tài khoản hoặc Email"
              name="usernameOrEmail"
              autoComplete="username"
              autoFocus
              value={formData.usernameOrEmail}
              onChange={handleChange}
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                '& input::-ms-reveal, & input::-ms-clear': { display: 'none' },
                '& input::-webkit-credentials-auto-fill-button': {
                  visibility: 'hidden',
                  display: 'none !important',
                },
              }}

              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                        onClick={toggleShowPassword}
                        edge="end"
                        disabled={loading}
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              inputProps={{
                'data-form-type': 'other',
                'data-lpignore': 'true',
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, py: 1.2, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập hệ thống'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="text"
                color="primary"
                onClick={() => navigate('/admin/forgot-password')}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                Bạn quên mật khẩu?
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
