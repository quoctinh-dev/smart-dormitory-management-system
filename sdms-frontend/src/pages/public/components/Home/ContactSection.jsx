import { Box, Container, Typography, Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Phone, Email, SupportAgent } from "@mui/icons-material";

export default function ContactSection() {
    return (
        <Box sx={{ py: 10, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
                <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: 6, background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white' }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="h3" fontWeight="900" mb={2}>
                                Cần hỗ trợ?
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300, mb: 4 }}>
                                Nếu bạn cần hỏi thêm về tình trạng phòng trống hoặc sự cố trong lúc đăng ký, hãy liên hệ ngay với Ban quản lý KTX.
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box display="flex" flexDirection="column" gap={3}>
                                <Box display="flex" alignItems="center" gap={2} bgcolor="rgba(255,255,255,0.1)" p={3} borderRadius={3}>
                                    <SupportAgent sx={{ fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Phòng Hành chính - Quản trị</Typography>
                                        <Typography variant="h6" fontWeight="bold">(028) 38.505.520 (Máy lẻ: 115 / 116)</Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" alignItems="center" gap={2} bgcolor="rgba(255,255,255,0.1)" p={3} borderRadius={3}>
                                    <Phone sx={{ fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Hotline Hỗ trợ KTX</Typography>
                                        <Typography variant="h6" fontWeight="bold">0902.992.306</Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" alignItems="center" gap={2} bgcolor="rgba(255,255,255,0.1)" p={3} borderRadius={3}>
                                    <Email sx={{ fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Email Chăm sóc Sinh viên</Typography>
                                        <Typography variant="h6" fontWeight="bold">ktx@stu.edu.vn</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
}
