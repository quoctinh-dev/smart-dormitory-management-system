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
            <Box component="footer" sx={{ bgcolor: "grey.900", color: "grey.500", py: 6, mt: 'auto' }}>
                <Container>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={4}>
                        <Box>
                            <Typography variant="body1" fontWeight="bold" color="common.white" gutterBottom>
                                Hệ Thống Quản Lý Ký Túc Xá
                            </Typography>
                            <Typography variant="body2">Giải pháp đăng ký trực tuyến nhanh chóng, minh bạch.</Typography>
                        </Box>

                        <Stack direction="row" spacing={3}>
                            {['Về chúng tôi', 'Liên hệ', 'Điều khoản'].map((item) => (
                                <Link key={item} href="#" color="inherit" underline="hover" variant="body2">
                                    {item}
                                </Link>
                            ))}
                        </Stack>

                        <Box textAlign={{ xs: "left", md: "right" }}>
                            <Typography variant="body2">Hotline: 1900-0000</Typography>
                            <Typography variant="caption">© {new Date().getFullYear()} KTX University.</Typography>
                        </Box>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}