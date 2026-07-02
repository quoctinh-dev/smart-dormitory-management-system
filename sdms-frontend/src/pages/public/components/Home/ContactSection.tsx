import { Phone, Email, SupportAgent } from '@mui/icons-material';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';

const CONTACT_METHODS = [
  {
    icon: <SupportAgent sx={{ fontSize: 40 }} />,
    label: 'Phòng Hành chính - Quản trị',
    value: '(028) 38.505.520 (Máy lẻ: 115 / 116)',
  },
  {
    icon: <Phone sx={{ fontSize: 40 }} />,
    label: 'Hotline Hỗ trợ KTX',
    value: '0902.992.306',
  },
  {
    icon: <Email sx={{ fontSize: 40 }} />,
    label: 'Email Chăm sóc Sinh viên',
    value: 'ktx@stu.edu.vn',
  },
];

export default function ContactSection() {
  return (
    <Box sx={{ py: 10, bgcolor: 'background.default' }}>
      <Container>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 8 },
            borderRadius: 6,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'common.white',
          }}
        >
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
                Cần hỗ trợ?
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300, mb: 4 }}>
                Nếu bạn cần hỏi thêm về tình trạng phòng trống hoặc sự cố trong lúc đăng ký, hãy
                liên hệ ngay với Ban quản lý KTX.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={3}>
                {CONTACT_METHODS.map((method, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      p: 3,
                      borderRadius: 3,
                    }}
                  >
                    {method.icon}
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {method.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {method.value}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
