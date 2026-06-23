import { Outlet, useNavigate, Link as RouterLink } from "react-router-dom";
import {
    Box, AppBar, Toolbar, Typography, Button, Container,
    Avatar, Stack, Link, CssBaseline
} from "@mui/material";

export default function PublicLayout() {
    const navigate = useNavigate();

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <CssBaseline />
            
            {/* NAVBAR */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(8px)",
                    borderBottom: 1,
                    borderColor: "divider", // Tự động lấy màu từ theme
                }}
            >
                <Container>
                    <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
                        <Stack
                            component={RouterLink}
                            to="/"
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{ textDecoration: 'none', color: 'text.primary' }}
                        >
                            <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>K</Avatar>
                            <Typography variant="h6" fontWeight="800" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                KTX Portal
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                            <Button variant="contained" onClick={() => navigate("/admin/login")}>
                                Đăng nhập
                            </Button>
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* MAIN CONTENT */}
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Outlet />
            </Box>

            {/* FOOTER */}
            <Box component="footer" sx={{ bgcolor: "#0f172a", color: "grey.400", pt: 8, pb: 4, mt: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Container>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={6} mb={6}>
                        <Box maxWidth={400}>
                            <Typography variant="h6" fontWeight="800" color="common.white" gutterBottom>
                                Ký Túc Xá STU
                            </Typography>
                            <Typography variant="body2" lineHeight={1.8} mb={2}>
                                Giải pháp đăng ký trực tuyến nhanh chóng, minh bạch thuộc hệ sinh thái Đại học Công nghệ Sài Gòn.
                            </Typography>
                            <Typography variant="body2" color="common.white">
                                📍 180 Cao Lỗ, Phường 4, Quận 8, TP.HCM
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={8}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight="bold" color="common.white" gutterBottom mb={2}>
                                    LIÊN KẾT NHANH
                                </Typography>
                                <Stack spacing={1.5}>
                                    {['Trang chủ', 'Đăng ký lưu trú', 'Tra cứu hồ sơ', 'Kích hoạt tài khoản'].map((item) => (
                                        <Link key={item} href="#" color="inherit" underline="hover" variant="body2">
                                            {item}
                                        </Link>
                                    ))}
                                </Stack>
                            </Box>
                            
                            <Box>
                                <Typography variant="subtitle2" fontWeight="bold" color="common.white" gutterBottom mb={2}>
                                    THÔNG TIN HỖ TRỢ
                                </Typography>
                                <Stack spacing={1.5}>
                                    <Typography variant="body2">📞 Hotline: <strong>0902.992.306</strong></Typography>
                                    <Typography variant="body2">☎️ P. Hành chính: (028) 38.505.520</Typography>
                                    <Typography variant="body2">✉️ Email: ktx@stu.edu.vn</Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </Stack>

                    <Box borderTop="1px solid rgba(255,255,255,0.1)" pt={4} textAlign="center">
                        <Typography variant="caption">
                            © {new Date().getFullYear()} Bản quyền thuộc về Ban Quản lý Ký túc xá - Trường Đại học Công nghệ Sài Gòn (STU).
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}