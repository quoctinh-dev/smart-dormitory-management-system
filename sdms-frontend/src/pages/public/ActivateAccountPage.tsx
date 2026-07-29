import { Visibility, VisibilityOff, Key, Person, Lock, LockReset } from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
    Container,
    Paper,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Fade,
    Stack,
    Divider,
    GlobalStyles,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

import { useActivateAccount } from '@/hooks/useActivateAccount';

export default function ActivateAccountPage() {
    const navigate = useNavigate();
    const {
        formData,
        showPassword,
        loading,
        success,
        handleChange,
        handleSubmit,
        toggleShowPassword,
    } = useActivateAccount();

    // Màn hình thông báo kích hoạt thành công
    if (success) {
        return (
            <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 }, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Fade in timeout={500}>
                    <Paper
                        elevation={4}
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'divider',
                            width: '100%'
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                py: 4,
                                px: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1.5,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <CheckCircleOutlineIcon sx={{ fontSize: 56, color: '#ffffff' }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.3px' }}>
                                Kích hoạt tài khoản thành công!
                            </Typography>
                        </Box>

                        <Box sx={{ p: { xs: 3, sm: 4 } }}>
                            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                                Mật khẩu chính thức của bạn đã được thiết lập. Bạn có thể sử dụng thông tin này để đăng nhập vào <b>Ứng dụng di động (Mobile App)</b> dành cho sinh viên nội trú.
                            </Typography>

                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={() => navigate('/')}
                                sx={{
                                    borderRadius: 2,
                                    py: 1.4,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    bgcolor: 'primary.main',
                                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                        boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.dark, 0.4)}`,
                                    },
                                }}
                            >
                                Quay lại trang chủ
                            </Button>
                        </Box>
                    </Paper>
                </Fade>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 }, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* GlobalStyles loại bỏ icon con mắt mặc định của Edge/Chrome */}
            <GlobalStyles
                styles={{
                    'input::-ms-reveal, input::-ms-clear': {
                        display: 'none !important',
                    },
                }}
            />
            <Fade in timeout={500}>
                <Paper
                    elevation={3}
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                        width: '100%'
                    }}
                >
                    {/* Header màu xanh */}
                    <Box
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            py: 3.5,
                            px: { xs: 3, sm: 4 },
                            textAlign: 'center',
                            backgroundImage: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'inline-flex',
                                p: 1.2,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255, 255, 255, 0.18)',
                                color: '#ffffff',
                                mb: 1.5,
                            }}
                        >
                            <LockReset sx={{ fontSize: 32 }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.3px', mb: 0.8 }}>
                            Kích hoạt tài khoản
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.88)',
                                px: { xs: 1, sm: 3 },
                                lineHeight: 1.5,
                                fontSize: '0.9rem',
                            }}
                        >
                            Hoàn tất thiết lập tài khoản sinh viên nội trú để đăng nhập và sử dụng hệ thống ứng dụng nội bộ.
                        </Typography>
                    </Box>

                    {/* Form thông tin */}
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{ p: { xs: 3, sm: 4 } }}
                    >
                        <Stack spacing={2.5} direction="column">
                            <TextField
                                label="Mã số sinh viên"
                                name="studentCode"
                                type="text"
                                variant="outlined"
                                fullWidth
                                required
                                value={formData.studentCode}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="Nhập MSSV của bạn"
                                autoComplete="username"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person color="primary" />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 2 }
                                    }
                                }}
                            />

                            <TextField
                                fullWidth
                                required
                                label="Mật khẩu tạm thời"
                                name="tempPassword"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                value={formData.tempPassword}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="Mặc định là Mã số sinh viên"
                                autoComplete="current-password"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Key color="primary" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={toggleShowPassword} edge="end" size="small">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 2 }
                                    }
                                }}
                            />

                            <Divider sx={{ my: 1 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    THIẾT LẬP MẬT KHẨU MỚI
                                </Typography>
                            </Divider>

                            <TextField
                                fullWidth
                                required
                                label="Mật khẩu mới"
                                name="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                value={formData.newPassword}
                                onChange={handleChange}
                                disabled={loading}
                                helperText="Tối thiểu từ 8 ký tự trở lên"
                                autoComplete="new-password"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="primary" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={toggleShowPassword} edge="end" size="small">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 2 }
                                    },
                                    formHelperText: {
                                        sx: { mt: 0.5, ml: 1 }
                                    }
                                }}
                            />

                            <TextField
                                fullWidth
                                required
                                label="Xác nhận mật khẩu mới"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="new-password"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="primary" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={toggleShowPassword} edge="end" size="small">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 2 }
                                    }
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                disableElevation
                                sx={{
                                    mt: 1.5,
                                    py: 1.4,
                                    fontSize: '0.98rem',
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    bgcolor: 'primary.main',
                                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                        boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.dark, 0.35)}`,
                                    },
                                }}
                            >
                                {loading ? 'Đang xử lý dữ liệu...' : 'Xác nhận kích hoạt tài khoản'}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Fade>
        </Container>
    );
}