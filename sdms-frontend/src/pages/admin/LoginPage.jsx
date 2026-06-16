import { useState } from "react";
import { 
    Paper, Stack, TextField, Typography, Button, 
    Alert, IconButton, InputAdornment, CircularProgress, Box 
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api";
import { useAuth } from "@/auth";

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
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await authApi.login({
                usernameOrEmail: formData.usernameOrEmail.trim(),
                password: formData.password,
            });

            login({
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
                user: res.user || { username: formData.usernameOrEmail, role: 'admin' },
            });

            navigate("/admin", { replace: true });
        } catch (err) {
            setError(err?.message || "Đăng nhập thất bại, vui lòng kiểm tra lại thông tin.");
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

                {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Stack spacing={2.5}>
                        <TextField 
                            label="Tên đăng nhập hoặc Email" 
                            name="usernameOrEmail" 
                            value={formData.usernameOrEmail} 
                            onChange={handleChange} 
                            required 
                        />
                        <TextField 
                            label="Mật khẩu" 
                            name="password" 
                            type={showPassword ? "text" : "password"}
                            value={formData.password} 
                            onChange={handleChange} 
                            required
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
                            sx={{ mt: 1 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "ĐĂNG NHẬP"}
                        </Button>
                    </Stack>
                </form>
            </Stack>
        </Paper>
    );
}