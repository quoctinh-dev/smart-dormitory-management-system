// 📄 File: src/pages/public/ActivateAccountPage.jsx
import React, { useState } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, Button, 
  Alert, IconButton, InputAdornment, Fade 
} from '@mui/material';
import { Visibility, VisibilityOff, Key, Email, Lock, LockReset } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api';

export default function ActivateAccountPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', tempPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { email, tempPassword, newPassword, confirmPassword } = formData;

    // Validation Client-side
    if (!email || !tempPassword || !newPassword || !confirmPassword) {
      return setError('Vui lòng điền đầy đủ tất cả các trường thông tin.');
    }
    if (newPassword.length < 8) {
      return setError('Mật khẩu mới phải có độ dài tối thiểu từ 8 ký tự trở lên.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Xác nhận mật khẩu mới không trùng khớp.');
    }

    setLoading(true);
    try {
      // 🌟 GỌI API CHUẨN ĐÉT SANG ENDPOINT POST BACKEND
      await authApi.activate({
        email: email.trim(),
        tempPassword: tempPassword.trim(),
        newPassword: newPassword
      });

      setSuccess(true);
    } catch (err) {
      console.error('Activation failed:', err);
      setError(err.response?.data?.message || err.message || 'Kích hoạt thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  // ---- MÀN HÌNH TRẠNG THÁI THÀNH CÔNG ----
  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Fade in timeout={500}>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, textAlign: 'center', boxShadow: 3 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Kích Hoạt Thành Công!
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 4 }}>
              Mật khẩu chính thức của bạn đã được thiết lập. Bây giờ bạn có thể quay lại đăng nhập hệ thống bằng tài khoản sinh viên.
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              onClick={() => navigate('/login')} // 🌟 Điều hướng về đúng trang login hệ thống
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
            >
              Quay lại Đăng nhập
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  // ---- FORM NHẬP LIỆU GIAO DIỆN CHÍNH ----
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Fade in timeout={600}>
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, boxShadow: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LockReset color="primary" sx={{ fontSize: 60, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Kích Hoạt Tài Khoản
            </Typography>
            <Typography sx={{ color: 'text.secondary', mt: 1 }}>
              Nhập Email đăng ký và Mật khẩu tạm thời (số CCCD) để hoàn tất thiết lập tài khoản sinh viên lần đầu.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              required
              label="Địa chỉ Email đăng ký"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              required
              label="Mật khẩu tạm thời (Số CCCD của bạn)"
              name="tempPassword"
              type="password"
              value={formData.tempPassword}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Key color="action" /></InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              required
              label="Mật khẩu mới"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              disabled={loading}
              helperText="Mật khẩu phải từ 8 ký tự trở lên."
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              required
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 2, py: 1.5, fontSize: '1.1rem', borderRadius: 2, fontWeight: 'bold', textTransform: 'none' }}
            >
              {loading ? 'Đang thực hiện kích hoạt...' : 'Xác Nhận Kích Hoạt'}
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
}

//