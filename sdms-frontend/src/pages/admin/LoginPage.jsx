import { useState } from "react";
import { 
    Paper, Stack, TextField, Typography, Button, 
    Alert, IconButton, InputAdornment, CircularProgress, Box 
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api";
import { useAuth, authStorage } from "@/auth";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ usernameOrEmail: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Xóa thông báo lỗi khi người dùng bắt đầu nhập lại
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(""); // Reset lỗi cũ

        try {
            const res = await authApi.login({
                usernameOrEmail: formData.usernameOrEmail.trim(),
                password: formData.password,
            });

            // Lưu token tạm thời để getMe có thể sử dụng
            authStorage.setTokens({
                accessToken: res.accessToken,
                refreshToken: res.refreshToken
            });

            // Lấy thông tin user thực tế
            const userData = await authApi.getMe();

            login({
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
                user: userData,
            });

            navigate("/admin", { replace: true });
        } catch (err) {
            // Lấy thông báo lỗi chi tiết từ server nếu có (axios response)
            const serverMessage = err.response?.data?.message || err.response?.data;
            const finalErrorMessage = typeof serverMessage === 'string' 
                ? serverMessage 
                : "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.";
            
            setError(finalErrorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: { xs: 3, md: 5 }, width: "100%", maxWidth: 420 }}>
            <Stack spacing={3}>
                <Box textAlign="center">
                    <Typography variant="h4" color="primary" gutterBottom>Admin Login</Typography>
                    <Typography color="text.secondary">Đăng nhập quản trị hệ thống KTX</Typography>
                </Box>

                {/* Alert sẽ không tự mất cho đến khi người dùng nhập lại nhờ logic trong handleChange */}
                {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Stack spacing={2.5}>
                        <TextField 
                            label="Tên đăng nhập hoặc Email" 
                            name="usernameOrEmail" 
                            value={formData.usernameOrEmail} 
                            onChange={handleChange} 
                            required 
                            fullWidth
                        />
                        <TextField 
                            label="Mật khẩu" 
                            name="password" 
                            type={showPassword ? "text" : "password"}
                            value={formData.password} 
                            onChange={handleChange} 
                            required
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button 
                            type="submit" 
                            variant="contained" 
                            size="large" 
                            disabled={loading}
                            sx={{ mt: 1, py: 1.5 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "ĐĂNG NHẬP"}
                        </Button>
                    </Stack>
                </form>
            </Stack>
        </Paper>
    );
}