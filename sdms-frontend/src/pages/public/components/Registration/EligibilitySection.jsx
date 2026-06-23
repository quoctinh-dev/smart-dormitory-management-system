import { Box, Typography, TextField, Alert } from "@mui/material";

export default function EligibilitySection({ formData, setFormData, error }) {
    return (
        <Box display="flex" flexDirection="column" gap={3} maxWidth={400} mx="auto" mt={4}>
            <Typography variant="h6" textAlign="center" fontWeight="bold">
                Kiểm tra điều kiện đăng ký
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
                Vui lòng nhập Mã số định danh (CCCD/CMND) để hệ thống đối chiếu điều kiện tham gia đợt tiếp nhận hồ sơ hiện hành.
            </Typography>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            <TextField
                label="Mã số định danh (CCCD)"
                variant="outlined"
                value={formData.cccd}
                onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                fullWidth
                required
                autoFocus
                placeholder="VD: 079200123456"
            />
        </Box>
    );
}
