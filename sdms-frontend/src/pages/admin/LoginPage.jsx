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
  CircularProgress 
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { useLogin } from '@/hooks/useLogin';

function LoginPage() {
  const {
    formData,
    showPassword,
    loading,
    error,
    handleChange,
    toggleShowPassword,
    handleSubmit
  } = useLogin();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh'
      }}
    >
      {/* TỐI ƯU: Loại bỏ sx borderRadius và boxShadow vì MuiCard styleOverrides ở theme đã lo phần này */}
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}> {/* TỐI ƯU: Responsive padding cho thiết bị di động */}
          
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
                mb: 1.5
              }}
            >
              <LockOutlined />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              Hệ thống Quản trị KTX
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Đăng nhập để tiếp tục vào phân hệ Admin
            </Typography>
          </Box>

          {/* Hiển thị lỗi */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {String(error)}
            </Alert>
          )}

          {/* Form nhập liệu */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
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
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Chuyển đổi hiển thị mật khẩu"
                        onClick={toggleShowPassword}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, py: 1.2, borderRadius: 2 }} // TỐI ƯU: Giảm lề mt tránh đẩy form lệch khung hình
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập hệ thống'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;