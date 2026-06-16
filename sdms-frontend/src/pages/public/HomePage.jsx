import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
    Box, Container, Button, Typography, Card, TextField, Paper, Stack, InputAdornment, useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid2"; // Sử dụng Grid2 để linh hoạt hơn
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function HomePage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [searchCccd, setSearchCccd] = useState('');

    const handleSearch = () => {
        if (searchCccd.trim()) navigate(`/status?cccd=${searchCccd.trim()}`);
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

                    {/* SEARCH BAR */}
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
                            placeholder="Nhập số CCCD/CMND..."
                            value={searchCccd}
                            onChange={(e) => setSearchCccd(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                            onClick={handleSearch}
                            sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 'bold' }}
                        >
                            Tra cứu
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