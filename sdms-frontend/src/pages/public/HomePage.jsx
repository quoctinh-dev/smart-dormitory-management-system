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
        <Box sx={{ pb: 10 }}>
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
                        Đăng ký KTX chỉ trong 3 bước
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 6, fontWeight: 300 }}>
                        Hệ thống nộp hồ sơ và xét duyệt ký túc xá trực tuyến hiện đại, nhanh chóng.
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
                            placeholder="Nhập số CCCD/CMND để kiểm tra điều kiện..."
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
                            {loading ? "Đang kiểm tra..." : "Kiểm tra"}
                        </Button>
                    </Paper>
                </Container>
            </Box>

            {/* ACTION CARDS */}
            <Container maxWidth="lg" sx={{ mt: -8 }}>
                <Grid container spacing={4} justifyContent="center">
                    <Grid size={{ xs: 12, md: 5 }}>
                        <FeatureCard 
                            icon={<AssignmentIndIcon sx={{ fontSize: 48, color: "primary.main" }} />}
                            title="Đăng ký mới"
                            description="Dành cho sinh viên chưa có hồ sơ hoặc muốn đăng ký mới cho học kỳ này."
                            buttonText="Bắt đầu đăng ký ngay"
                            to="/register"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 5 }}>
                        <FeatureCard 
                            icon={<CheckCircleOutlineIcon sx={{ fontSize: 48, color: "secondary.main" }} />}
                            title="Theo dõi trạng thái"
                            description="Kiểm tra kết quả xét duyệt, bổ sung hồ sơ hoặc xem thông tin nhận phòng."
                            buttonText="Xem trạng thái hồ sơ"
                            to="/status"
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
            </Container>

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

// Sub-component để giữ code sạch
const FeatureCard = ({ icon, title, description, buttonText, to, variant = "contained" }) => (
    <Card sx={{ p: 4, borderRadius: 4, height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 } }}>
        <Box sx={{ mb: 2 }}>{icon}</Box>
        <Typography variant="h5" fontWeight="700" gutterBottom>{title}</Typography>
        <Typography color="text.secondary" mb={4}>{description}</Typography>
        <Button fullWidth variant={variant} size="large" component={RouterLink} to={to} sx={{ borderRadius: 3 }}>
            {buttonText}
        </Button>
    </Card>
);