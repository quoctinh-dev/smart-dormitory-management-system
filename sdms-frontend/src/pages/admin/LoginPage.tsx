import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
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
import { alpha } from '@mui/material/styles';
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
                p: { xs: 2, sm: 3 },
            }}
        >
            <Paper
                variant="outlined"
                sx={{
                    width: '100%',
                    maxWidth: 480, // Tăng độ rộng để form trông "bành" hơn
                    p: { xs: 3, sm: 4 },
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                }}
            >
                {/* Tiêu đề & Biểu tượng (Thu gọn khoảng cách dọc) */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2.5 }}>
                    <Box
                        sx={{
                            p: 1.25,
                            borderRadius: '50%',
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 1.5,
                        }}
                    >
                        <LockOutlined sx={{ fontSize: 26 }} />
                    </Box>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                        Hệ thống quản trị KTX
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Đăng nhập để tiếp tục truy cập vào phân hệ Admin
                    </Typography>
                </Box>

                {/* Thông báo lỗi */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.5 }}>
                        {String(error)}
                    </Alert>
                )}

                {/* Biểu mẫu đăng nhập (Loại bỏ margin="normal" để tránh form bị dài) */}
                <Box component="form" onSubmit={onFormSubmit} noValidate>
                    <TextField
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
                        sx={{
                            mb: 2, // Thay vì margin normal, dùng margin bottom nhỏ gọn
                            '& .MuiOutlinedInput-root': { borderRadius: 1.5 }
                        }}
                    />

                    <TextField
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
                            mb: 2.5,
                            '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
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
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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
                        disableElevation // Bỏ hiệu ứng đổ bóng của nút để chuẩn flat design
                        disabled={loading}
                        sx={{
                            mb: 1.5,
                            py: 1.2,
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập'}
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                        <Button
                            variant="text"
                            color="inherit"
                            onClick={() => navigate('/admin/forgot-password')}
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
                            Bạn quên mật khẩu?
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default LoginPage;