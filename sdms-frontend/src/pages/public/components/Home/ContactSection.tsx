import { PhoneOutlined, EmailOutlined, SupportAgentOutlined } from '@mui/icons-material';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';

const CONTACT_METHODS = [
  {
    icon: <SupportAgentOutlined sx={{ fontSize: 28 }} />,
    label: 'Phòng Hành chính - Quản trị',
    value: '(028) 38.505.520 (Máy lẻ: 115 / 116)',
  },
  {
    icon: <PhoneOutlined sx={{ fontSize: 28 }} />,
    label: 'Hotline Hỗ trợ KTX',
    value: '0902.992.306',
  },
  {
    icon: <EmailOutlined sx={{ fontSize: 28 }} />,
    label: 'Email Chăm sóc Sinh viên',
    value: 'ktx@stu.edu.vn',
  },
];

export default function ContactSection() {
  return (
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
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
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
                  Cần hỗ trợ?
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300, mb: 0, lineHeight: 1.6 }}>
                  Nếu bạn cần hỏi thêm về tình trạng phòng trống hoặc sự cố trong lúc đăng ký, hãy
                  liên hệ ngay với Ban quản lý KTX.
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="column" spacing={2.5}>
                  {CONTACT_METHODS.map((method, index) => (
                      <Stack
                          key={index}
                          direction="row"
                          alignItems="center"
                          spacing={2.5}
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.12)',
                            p: 3,
                            borderRadius: 4,
                            border: '1px solid rgba(255, 255, 255, 0.16)',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.02)',
                              bgcolor: 'rgba(255, 255, 255, 0.16)',
                            },
                          }}
                      >
                        <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'rgba(255, 255, 255, 0.16)',
                              color: 'common.white',
                              flexShrink: 0,
                            }}
                        >
                          {method.icon}
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ opacity: 0.75, mb: 0.5 }}>
                            {method.label}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
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