import { MailOutline } from '@mui/icons-material';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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
                p: { xs: 2, sm: 3 },
            }}
        >
            <Paper
                variant="outlined"
                sx={{
                    width: '100%',
                    maxWidth: 400,
                    p: { xs: 3, sm: 4 },
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                }}
            >
                {/* Tiêu đề & Biểu tượng */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: '50%',
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 2,
                        }}
                    >
                        <MailOutline sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                        Khôi phục mật khẩu
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Vui lòng nhập email đã đăng ký. Hệ thống sẽ gửi một liên kết an toàn để bạn đặt lại
                        mật khẩu mới.
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
                        {error}
                    </Alert>
                )}

                {success ? (
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 1.5 }}>
                            Yêu cầu đã được xử lý. Vui lòng kiểm tra hộp thư email (bao gồm cả thư rác) để lấy
                            liên kết khôi phục.
                        </Alert>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => navigate('/admin/login')}
                            sx={{
                                borderRadius: 1.5,
                                py: 1.2,
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Quay lại đăng nhập
                        </Button>
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
                                '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disableElevation
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.2,
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Gửi yêu cầu'}
                        </Button>

                        <Box sx={{ mt: 1, textAlign: 'center' }}>
                            <Button
                                variant="text"
                                color="inherit"
                                onClick={() => navigate('/admin/login')}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    color: 'text.secondary',
                                    '&:hover': {
                                        bgcolor: 'transparent',
                                        color: 'primary.main',
                                    }
                                }}
                            >
                                Quay lại đăng nhập
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

export default ForgotPasswordPage;