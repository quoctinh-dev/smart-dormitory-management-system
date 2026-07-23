import { LocationOnOutlined, ApartmentOutlined, SecurityOutlined } from '@mui/icons-material';
import { Box, Container, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';

const FEATURES_DATA = [
    {
        icon: <LocationOnOutlined sx={{ fontSize: 24 }} />,
        title: 'Vị trí đắc địa',
        desc: 'Tọa lạc ngay trong khuôn viên trường (180 Cao Lỗ, Phường 4, Quận 8). Sinh viên tiết kiệm tối đa thời gian di chuyển đến giảng đường, thư viện và khu thể thao.',
    },
    {
        icon: <ApartmentOutlined sx={{ fontSize: 24 }} />,
        title: 'Cơ sở vật chất hiện đại',
        desc: 'Không gian sống tiện nghi với đầy đủ giường, tủ cá nhân, bàn học và máy lạnh. Hệ thống Wi-Fi tốc độ cao cùng khu sinh hoạt chung rộng rãi, lý tưởng.',
    },
    {
        icon: <SecurityOutlined sx={{ fontSize: 24 }} />,
        title: 'An ninh nghiêm ngặt 24/7',
        desc: 'Đội ngũ bảo vệ chuyên nghiệp túc trực toàn thời gian kết hợp hệ thống kiểm soát ra vào thông minh, đảm bảo môi trường sống an toàn tuyệt đối.',
    },
];

export default function AboutSection() {
    return (
        <Box sx={{ py: 10, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        mb: 1.5,
                        letterSpacing: '-0.5px'
                    }}
                >
                    Tổng quan Ký túc xá STU
                </Typography>

                <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', textAlign: 'center', mb: 6, fontWeight: 400, px: 2, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
                >
                    Môi trường sống an toàn, hiện đại và tiện nghi – Nơi chắp cánh cho hành trình đại học rực rỡ
                </Typography>

                <Grid container spacing={3}>
                    {FEATURES_DATA.map((item, index) => (
                        <Grid size={{ xs: 12, md: 4 }} key={index}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 3.5,
                                    height: '100%',
                                    borderRadius: 2,
                                    textAlign: 'center',
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        borderColor: 'primary.main',
                                    },
                                }}
                            >
                                <Box
                                    sx={(theme) => ({
                                        mb: 2.5,
                                        width: 48,
                                        height: 48,
                                        mx: 'auto',
                                        borderRadius: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        color: 'primary.main',
                                    })}
                                >
                                    {item.icon}
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                    {item.title}
                                </Typography>

                                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    {item.desc}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}