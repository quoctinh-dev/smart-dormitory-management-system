import { Box, Container, Typography, Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { LocationOn, Apartment, Security } from "@mui/icons-material";

export default function AboutSection() {
    const features = [
        {
            icon: <LocationOn color="primary" sx={{ fontSize: 48 }} />,
            title: "Vị trí Đắc địa",
            desc: "Nằm ngay trong khuôn viên trường (180 Cao Lỗ, Phường 4, Quận 8, TP.HCM). Cực kỳ thuận tiện di chuyển đến phòng học, thư viện, khu thể thao."
        },
        {
            icon: <Apartment color="primary" sx={{ fontSize: 48 }} />,
            title: "Cơ sở Vật chất Hiện đại",
            desc: "Phòng ốc trang bị đầy đủ giường, tủ cá nhân, bàn học, máy lạnh. Hệ thống Wi-Fi miễn phí và không gian sinh hoạt chung rộng rãi."
        },
        {
            icon: <Security color="primary" sx={{ fontSize: 48 }} />,
            title: "An ninh 24/7",
            desc: "Đội ngũ bảo vệ túc trực 24/7, hệ thống kiểm soát ra vào thông minh đảm bảo an toàn tuyệt đối cho sinh viên lưu trú."
        }
    ];

    return (
        <Box sx={{ py: 10, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
                <Typography variant="h3" fontWeight="900" textAlign="center" mb={2}>
                    Tổng quan Ký túc xá STU
                </Typography>
                <Typography variant="h6" color="text.secondary" textAlign="center" mb={8} fontWeight="400">
                    Môi trường sống an toàn, hiện đại và tiện nghi dành cho sinh viên
                </Typography>

                <Grid container spacing={4}>
                    {features.map((item, index) => (
                        <Grid size={{ xs: 12, md: 4 }} key={index}>
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 4, 
                                    height: '100%', 
                                    borderRadius: 4, 
                                    textAlign: 'center',
                                    border: '1px solid #e2e8f0',
                                    transition: '0.3s',
                                    '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }
                                }}
                            >
                                <Box sx={{ mb: 3 }}>{item.icon}</Box>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>{item.title}</Typography>
                                <Typography color="text.secondary" lineHeight={1.6}>{item.desc}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
