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
                        elevation={0}
                        sx={{
                            p: 5,
                            borderRadius: 6,
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.02)'
                        }}
                    >
                        <CheckCircleIcon color="success" sx={{ fontSize: 72, mb: 2.5 }} />
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '-0.5px' }}>
                            Kích hoạt thành công!
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', mb: 4, px: 2, lineHeight: 1.6 }}>
                            Mật khẩu chính thức của bạn đã được thiết lập. Vui lòng sử dụng thông tin này đăng nhập vào <b>Ứng dụng di động (Mobile App)</b> dành cho sinh viên nội trú để bắt đầu trải nghiệm dịch vụ.
                        </Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={() => navigate('/')}
                            sx={{
                                borderRadius: 3,
                                py: 1.6,
                                fontWeight: 700,
                                boxShadow: 'none',
                                '&:hover': { boxShadow: 'none' }
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
                    elevation={0}
                    sx={{
                        p: { xs: 4, sm: 5 },
                        borderRadius: 6,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)'
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4.5 }}>
                        <Box
                            sx={(theme) => ({
                                display: 'inline-flex',
                                p: 1.5,
                                borderRadius: 4,
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                                mb: 2
                            })}
                        >
                            <LockReset sx={{ fontSize: 40 }} />
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px', mb: 1 }}>
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
                        spacing={3}
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
                                    sx: { borderRadius: 3 }
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
                                    sx: { borderRadius: 3 }
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
                                    sx: { borderRadius: 3 }
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
                                    sx: { borderRadius: 3 }
                                }
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={loading}
                            sx={{
                                mt: 1,
                                py: 1.6,
                                fontSize: '1rem',
                                borderRadius: 3,
                                fontWeight: 700,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': { boxShadow: 'none' }
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