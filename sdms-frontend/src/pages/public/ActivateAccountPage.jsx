import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Container, InputAdornment, IconButton, Alert } from '@mui/material';
import { Visibility, VisibilityOff, LockReset, Email, VpnKey } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { authApi } from '@/api';
import { validatePassword } from '@/utils/validate'; 

export default function ActivateAccountPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    tempPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      return setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
    }

    if (!validatePassword(formData.newPassword)) {
      return setError('Mật khẩu phải từ 8-50 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@#$%^&+=!).');
    }

    setLoading(true);
    try {
      await authApi.activate({
        email: formData.email.trim(),
        tempPassword: formData.tempPassword,
        newPassword: formData.newPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi kích hoạt tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  // ---- MÀN HÌNH TRẠNG THÁI THÀNH CÔNG ----
  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Kích Hoạt Thành Công!
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 4 }}>
            Tài khoản định danh của sinh viên đã được kích hoạt. Bạn có thể quay lại đăng nhập hệ thống ngay lúc này.
          </Typography>
          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            onClick={() => navigate('/')}
          >
            Quay lại Đăng nhập
          </Button>
        </Paper>
      </Container>
    );
  }

  // ---- FORM NHẬP LIỆU GIAO DIỆN CHÍNH ----
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LockReset color="primary" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Kích Hoạt Tài Khoản
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1 }}>
            Vui lòng hoàn tất thiết lập bảo mật để truy cập vào Hệ thống Quản lý Ký túc xá.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Thư điện tử (Email)"
            name="email"
            type="email"
            fullWidth
            required
            sx={{ mb: 2.5 }} 
            value={formData.email}
            onChange={handleChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }
            }}
          />

          <TextField
            label="Mã số định danh (CCCD/CMND)"
            name="tempPassword"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            sx={{ mb: 2.5 }}
            value={formData.tempPassword}
            onChange={handleChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKey color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          <TextField
            label="Mật khẩu mới"
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            sx={{ mb: 2.5 }}
            value={formData.newPassword}
            onChange={handleChange}
            helperText="Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
          />

          <TextField
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            sx={{ mb: 1 }}
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            sx={{ mt: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
          >
            {loading ? 'Đang xử lý...' : 'Xác Nhận Kích Hoạt'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}