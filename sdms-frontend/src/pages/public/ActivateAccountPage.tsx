// 📄 File: src/pages/public/ActivateAccountPage.jsx
import { Visibility, VisibilityOff, Key, Person, Lock, LockReset } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  Fade,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { authApi } from '@/api';

export default function ActivateAccountPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentCode: '',
    tempPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { studentCode, tempPassword, newPassword, confirmPassword } = formData;

    // Validation Client-side
    if (!studentCode || !tempPassword || !newPassword || !confirmPassword) {
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
        studentCode: studentCode.trim(),
        tempPassword: tempPassword.trim(),
        newPassword: newPassword,
      });

      setSuccess(true);
    } catch (err: unknown) {
      console.error('Activation failed:', err);
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        errorObj.response?.data?.message ||
          errorObj.message ||
          'Kích hoạt thất bại. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ---- MÀN HÌNH TRẠNG THÁI THÀNH CÔNG ----
  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Fade in timeout={500}>
          <Paper
            variant="outlined"
            sx={{ p: 4, borderRadius: 4, textAlign: 'center', boxShadow: 3 }}
          >
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Kích Hoạt Thành Công!
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 4 }}>
              Mật khẩu chính thức của bạn đã được thiết lập. Vui lòng tải xuống hoặc mở <b>Ứng dụng trên Điện thoại (Mobile App)</b> để đăng nhập vào hệ thống KTX.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate('/')}
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
            >
              Về Trang Chủ KTX
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
              Nhập Mã sinh viên và Mật khẩu tạm thời (chính là Mã sinh viên của bạn) để hoàn tất thiết lập tài khoản.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <TextField
              label="Mã Sinh Viên"
              name="studentCode"
              type="text"
              variant="outlined"
              fullWidth
              required
              value={formData.studentCode}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              required
              label="Mật khẩu tạm thời (Mã sinh viên)"
              name="tempPassword"
              type="password"
              value={formData.tempPassword}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Key color="action" />
                  </InputAdornment>
                ),
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
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
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
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                fontWeight: 'bold',
                textTransform: 'none',
              }}
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
