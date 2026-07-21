import { Visibility, VisibilityOff, LockReset } from '@mui/icons-material';
import {
    Box,
    Paper,
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
                minHeight: '75vh',
                p: { xs: 2, sm: 3 },
            }}
        >
            <Paper
                variant="outlined"
                sx={{
                    width: '100%',
                    maxWidth: 420,
                    p: { xs: 3, sm: 4 },
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Box
                        sx={{
                            bgcolor: (theme) => theme.palette.action.selected,
                            color: 'primary.main',
                            p: 1.5,
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 1.5,
                        }}
                    >
                        <LockReset sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Đặt lại mật khẩu
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>
                        Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.5 }}>
                        {error}
                    </Alert>
                )}

                {success ? (
                    <Box sx={{ textAlign: 'center' }}>
                        <Alert severity="success" sx={{ mb: 2.5, borderRadius: 1.5 }}>
                            Mật khẩu đã được thay đổi thành công!
                        </Alert>
                        <Button
                            fullWidth
                            variant="contained"
                            disableElevation
                            onClick={() => navigate('/admin/login')}
                            sx={{
                                borderRadius: 1.5,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 600,
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
                            size="small"
                            name="password"
                            label="Mật khẩu mới"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={toggleShowPassword} edge="end" size="small" disabled={loading}>
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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
                            size="small"
                            name="confirmPassword"
                            label="Xác nhận mật khẩu mới"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disableElevation
                            disabled={loading}
                            sx={{
                                mt: 2.5,
                                py: 1,
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Lưu mật khẩu mới'}
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

export default ResetPasswordPage;