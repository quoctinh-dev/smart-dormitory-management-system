import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
    Box, Container, Button, Typography, Card, TextField, Paper, InputAdornment, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import periodApi from "../../api/periodApi";
import FeatureCard from "../../components/common/FeatureCard";
import AboutSection from "./components/Home/AboutSection";
import CostSection from "./components/Home/CostSection";
import ProcessSection from "./components/Home/ProcessSection";
import ContactSection from "./components/Home/ContactSection";

export default function HomePage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [searchCccd, setSearchCccd] = useState('');
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [checkResult, setCheckResult] = useState({ success: false, message: '' });

    const handleCheckEligibility = async () => {
        if (!searchCccd.trim()) return;
        setLoading(true);
        try {
            const res = await periodApi.checkEligibility({ cccd: searchCccd.trim() });
            // Cấu trúc response từ api là axiosClient -> data
            setCheckResult({ success: true, message: res.message || "Bạn đủ điều kiện đăng ký đợt này!" });
        } catch (error) {
            setCheckResult({ 
                success: false, 
                message: error.response?.data?.message || error.message || "Bạn không thuộc danh sách ưu tiên đợt này." 
            });
        } finally {
            setLoading(false);
            setDialogOpen(true);
        }
    };

    return (
        <Box>
            {/* HERO SECTION */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    color: "common.white",
                    pt: 12,
                    pb: 20,
                    textAlign: "center",
                }}
            >
                <Container maxWidth="md">
                    <Typography variant="h2" fontWeight="800" mb={2} sx={{ letterSpacing: '-1px' }}>
                        Hệ thống Quản lý Ký túc xá Thông minh
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 6, fontWeight: 300 }}>
                        Nền tảng đăng ký, xét duyệt và quản lý lưu trú trực tuyến toàn diện.
                    </Typography>

                    {/* SEARCH BAR FOR ELIGIBILITY */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 1,
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            maxWidth: 640,
                            mx: "auto",
                            bgcolor: 'white'
                        }}
                    >
                        <TextField
                            fullWidth
                            placeholder="Nhập Mã định danh (CCCD/CMND) để tra cứu..."
                            value={searchCccd}
                            onChange={(e) => setSearchCccd(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCheckEligibility()}
                            variant="standard"
                            sx={{ px: 2 }}
                            InputProps={{
                                disableUnderline: true,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleCheckEligibility}
                            disabled={loading}
                            sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 'bold', minWidth: '120px' }}
                        >
                            {loading ? "Đang xử lý..." : "Kiểm tra"}
                        </Button>
                    </Paper>
                </Container>
            </Box>

            {/* ACTION CARDS */}
            <Container maxWidth="lg" sx={{ mt: -8, mb: 10, position: 'relative', zIndex: 2 }}>
                <Grid container spacing={4} justifyContent="center">
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FeatureCard 
                            icon={<AssignmentIndIcon sx={{ fontSize: 48, color: "primary.main" }} />}
                            title="Đăng ký lưu trú"
                            description="Tiếp nhận hồ sơ đăng ký nội trú trực tuyến đối với sinh viên đủ điều kiện."
                            buttonText="Tiến hành nộp hồ sơ"
                            to="/register"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FeatureCard 
                            icon={<CheckCircleOutlineIcon sx={{ fontSize: 48, color: "secondary.main" }} />}
                            title="Tra cứu tiến độ"
                            description="Theo dõi quy trình xét duyệt, cập nhật trạng thái thanh toán và thông tin phòng."
                            buttonText="Tra cứu hồ sơ"
                            to="/status"
                            variant="outlined"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FeatureCard 
                            icon={<CheckCircleOutlineIcon sx={{ fontSize: 48, color: "success.main" }} />}
                            title="Kích hoạt định danh"
                            description="Khởi tạo tài khoản hệ thống dành cho sinh viên đã hoàn tất thủ tục lưu trú."
                            buttonText="Thực hiện kích hoạt"
                            to="/activate"
                            variant="contained"
                            color="success"
                        />
                    </Grid>
                </Grid>
            </Container>

            {/* --- Thông Tin KTX STU --- */}
            <AboutSection />
            <CostSection />
            <ProcessSection />
            <ContactSection />

            {/* DIALOG KẾT QUẢ KIỂM TRA */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Kết quả kiểm tra điều kiện</DialogTitle>
                <DialogContent dividers>
                    <Alert severity={checkResult.success ? "success" : "error"} variant="filled">
                        {checkResult.message}
                    </Alert>
                    {checkResult.success && (
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Bạn đã đủ điều kiện, vui lòng nhấn "Bắt đầu đăng ký ngay" để tiếp tục.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="inherit">Đóng</Button>
                    {checkResult.success && (
                        <Button variant="contained" color="primary" onClick={() => navigate('/register')}>
                            Đăng ký ngay
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
}
