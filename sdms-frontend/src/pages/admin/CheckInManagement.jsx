import { useState } from "react";
import {
    Box, Typography, Paper, TextField, Button, Avatar, Divider, Chip, CircularProgress, Alert
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Search, HowToReg, Hotel, VpnKey, Celebration } from "@mui/icons-material";
import axiosClient from "@/api/axiosClient";
import confetti from "canvas-confetti";

export default function CheckInManagement() {
    const [cccd, setCccd] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkInLoading, setCheckInLoading] = useState(false);
    const [error, setError] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");

    const handleSearch = async () => {
        if (!cccd.trim()) return;
        setLoading(true);
        setError(null);
        setSuccessMsg("");
        setStudentData(null);

        try {
            const res = await axiosClient.get(`/admin/check-in/search?cccd=${cccd.trim()}`);
            setStudentData(res.data); // data chứa assignmentId, studentName, portraitUrl, etc.
        } catch (err) {
            setError(err.response?.data?.message || "Không tìm thấy dữ liệu hoặc có lỗi xảy ra.");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!studentData?.assignmentId) return;
        setCheckInLoading(true);
        setError(null);
        setSuccessMsg("");

        try {
            await axiosClient.post(`/admin/check-in/${studentData.assignmentId}`);
            setSuccessMsg(`Sinh viên ${studentData.studentName} đã nhận phòng thành công!`);
            setStudentData(null);
            setCccd("");
            
            // Bắn pháo hoa ăn mừng Check-in thành công
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899']
            });

        } catch (err) {
            setError(err.response?.data?.message || "Đã xảy ra lỗi khi Check-in.");
        } finally {
            setCheckInLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_API_URL}${path}`;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Quầy Lễ Tân: Nhận Phòng (Check-in)
                </Typography>
                <Typography color="text.secondary">
                    Tìm kiếm sinh viên bằng CCCD để đối chiếu khuôn mặt và bàn giao chìa khóa phòng.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* CỘT TRÁI: TÌM KIẾM */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 4, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                            <Search color="primary" /> Tra cứu sinh viên
                        </Typography>

                        <TextField
                            fullWidth
                            label="Nhập Mã số định danh (CCCD)"
                            variant="outlined"
                            value={cccd}
                            onChange={(e) => setCccd(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="VD: 079200123456"
                            autoFocus
                        />

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                            onClick={handleSearch}
                            disabled={loading || !cccd.trim()}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Tìm Kiếm"}
                        </Button>

                        {error && (
                            <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {successMsg && (
                            <Alert severity="success" sx={{ mt: 3, borderRadius: 2, fontSize: '1.1rem' }}>
                                <strong>Tuyệt vời!</strong> {successMsg}
                            </Alert>
                        )}
                    </Paper>
                </Grid>

                {/* CỘT PHẢI: KẾT QUẢ VÀ ACTION */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 4, height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                        {!studentData ? (
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} opacity={0.5}>
                                <HowToReg sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6">Chưa có thông tin tra cứu</Typography>
                                <Typography variant="body2">Vui lòng nhập CCCD ở khung bên trái để bắt đầu</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ animation: 'fadeIn 0.5s' }}>
                                <Typography variant="h6" fontWeight="bold" mb={3} color="primary.main" borderBottom="2px solid" borderColor="primary.light" pb={1} display="inline-block">
                                    Kết Quả Đối Chiếu
                                </Typography>

                                <Grid container spacing={4}>
                                    {/* Ảnh chân dung */}
                                    <Grid size={{ xs: 12, sm: 4 }} display="flex" flexDirection="column" alignItems="center">
                                        <Avatar
                                            variant="rounded"
                                            src={getImageUrl(studentData.portraitUrl)}
                                            sx={{ width: 150, height: 200, mb: 2, border: '4px solid #fff', boxShadow: 3 }}
                                        >
                                            Chưa có ảnh
                                        </Avatar>
                                        <Chip label="Ảnh gốc từ Hồ sơ" color="info" size="small" />
                                    </Grid>

                                    {/* Thông tin chi tiết */}
                                    <Grid size={{ xs: 12, sm: 8 }}>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            {studentData.studentName}
                                        </Typography>
                                        <Typography color="text.secondary" gutterBottom>
                                            MSSV: <strong>{studentData.studentCode}</strong> | CCCD: <strong>{studentData.cccd}</strong>
                                        </Typography>
                                        <Typography color="text.secondary" mb={3}>
                                            Giới tính: <strong>{studentData.gender === 'MALE' ? 'Nam' : 'Nữ'}</strong>
                                        </Typography>

                                        <Divider sx={{ mb: 3 }} />

                                        <Box sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: 3, border: '1px solid #bbf7d0' }}>
                                            <Typography variant="subtitle2" color="success.dark" display="flex" alignItems="center" gap={1} mb={1}>
                                                <Hotel fontSize="small" /> Vị trí được cấp:
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold" color="success.main" fontSize="1.1rem">
                                                {studentData.buildingName} - {studentData.floorName} - Phòng {studentData.roomName}
                                            </Typography>
                                            <Typography variant="h6" color="error.main" fontWeight="900" mt={1}>
                                                GIƯỜNG: {studentData.bedName}
                                            </Typography>
                                        </Box>

                                        <Button
                                            variant="contained"
                                            color="success"
                                            fullWidth
                                            size="large"
                                            startIcon={<VpnKey />}
                                            sx={{ mt: 4, py: 2, fontSize: '1.2rem', borderRadius: 3, fontWeight: 'bold' }}
                                            onClick={handleCheckIn}
                                            disabled={checkInLoading}
                                        >
                                            {checkInLoading ? "Đang xử lý..." : "Xác Nhận Nhận Phòng (Check-in)"}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
