import { LocationOnOutlined, ApartmentOutlined, SecurityOutlined } from '@mui/icons-material';
import { Box, Container, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';

const FEATURES_DATA = [
  {
    icon: <LocationOnOutlined sx={{ fontSize: 28 }} />,
    title: 'Vị trí đắc địa',
    desc: 'Tọa lạc ngay trong khuôn viên trường (180 Cao Lỗ, Phường 4, Quận 8). Sinh viên tiết kiệm tối đa thời gian di chuyển đến giảng đường, thư viện và khu thể thao.',
  },
  {
    icon: <ApartmentOutlined sx={{ fontSize: 28 }} />,
    title: 'Cơ sở vật chất hiện đại',
    desc: 'Không gian sống tiện nghi với đầy đủ giường, tủ cá nhân, bàn học và máy lạnh. Hệ thống Wi-Fi tốc độ cao cùng khu sinh hoạt chung rộng rãi, lý tưởng.',
  },
  {
    icon: <SecurityOutlined sx={{ fontSize: 28 }} />,
    title: 'An ninh nghiêm ngặt 24/7',
    desc: 'Đội ngũ bảo vệ chuyên nghiệp túc trực toàn thời gian kết hợp hệ thống kiểm soát ra vào thông minh, đảm bảo môi trường sống an toàn tuyệt đối.',
  },
];

export default function AboutSection() {
  return (
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                textAlign: 'center',
                mb: 2,
                letterSpacing: '-0.5px'
              }}
          >
            Tổng quan Ký túc xá STU
          </Typography>

          <Typography
              variant="h6"
              sx={{ color: 'text.secondary', textAlign: 'center', mb: 8, fontWeight: 400, px: 2 }}
          >
            Môi trường sống an toàn, hiện đại và tiện nghi – Nơi chắp cánh cho hành trình đại học rực rỡ
          </Typography>

          <Grid container spacing={4}>
            {FEATURES_DATA.map((item, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
                  <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        height: '100%',
                        borderRadius: 4,
                        textAlign: 'center',
                        border: 1,
                        borderColor: 'divider',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          borderColor: 'primary.main',
                          boxShadow: (theme) => theme.shadows[4],
                        },
                      }}
                  >
                    <Box
                        sx={(theme) => ({
                          mb: 3,
                          width: 56,
                          height: 56,
                          mx: 'auto',
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: 'primary.main',
                        })}
                    >
                      {item.icon}
                    </Box>

                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                      {item.title}
                    </Typography>

                    <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, fontSize: '0.95rem' }}>
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