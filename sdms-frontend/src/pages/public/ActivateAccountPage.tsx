import { Visibility, VisibilityOff, Key, Person, Lock, LockReset } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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

    if (success) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Fade in timeout={500}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 5,
                            borderRadius: 2,
                            textAlign: 'center',
                            borderColor: 'divider',
                        }}
                    >
                        <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2.5 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: '-0.5px' }}>
                            Kích hoạt thành công!
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, px: 2, lineHeight: 1.6 }}>
                            Mật khẩu chính thức của bạn đã được thiết lập. Vui lòng sử dụng thông tin này đăng nhập vào <b>Ứng dụng di động (Mobile App)</b> dành cho sinh viên nội trú để bắt đầu trải nghiệm dịch vụ.
                        </Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            size="medium"
                            onClick={() => navigate('/')}
                            disableElevation
                            sx={{
                                borderRadius: 1.5,
                                py: 1.2,
                                fontWeight: 600,
                                textTransform: 'none',
                            }}
                        >
                            Quay lại trang chủ
                        </Button>
                    </Paper>
                </Fade>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Fade in timeout={600}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 2,
                        borderColor: 'divider',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={(theme) => ({
                                display: 'inline-flex',
                                p: 1.5,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                                mb: 2,
                            })}
                        >
                            <LockReset sx={{ fontSize: 32 }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.5px', mb: 1 }}>
                            Kích hoạt tài khoản
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', px: 2, lineHeight: 1.5 }}>
                            Hoàn tất thiết lập tài khoản sinh viên nội trú để đăng nhập và sử dụng hệ thống ứng dụng nội bộ.
                        </Typography>
                    </Box>

                    <Stack
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        spacing={2.5}
                        direction="column"
                    >
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
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person color="action" />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 1.5 }
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
                            placeholder="Mặc định là Mã số sinh viên của bạn"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Key color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={toggleShowPassword} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 1.5 }
                                }
                            }}
                        />

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
                            helperText="Độ dài yêu cầu tối thiểu từ 8 ký tự trở lên"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={toggleShowPassword} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 1.5 }
                                },
                                formHelperText: {
                                    sx: { mt: 0.8, ml: 1 }
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
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={toggleShowPassword} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 1.5 }
                                }
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="medium"
                            fullWidth
                            disabled={loading}
                            disableElevation
                            sx={{
                                mt: 1,
                                py: 1.2,
                                fontSize: '0.95rem',
                                borderRadius: 1.5,
                                fontWeight: 600,
                                textTransform: 'none',
                            }}
                        >
                            {loading ? 'Đang xác thực dữ liệu...' : 'Xác nhận kích hoạt tài khoản'}
                        </Button>
                    </Stack>
                </Paper>
            </Fade>
        </Container>
    );
}