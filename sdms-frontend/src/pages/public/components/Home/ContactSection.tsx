import { PhoneOutlined, EmailOutlined, SupportAgentOutlined } from '@mui/icons-material';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';

const CONTACT_METHODS = [
  {
    icon: <SupportAgentOutlined sx={{ fontSize: 24 }} />,
    label: 'Phòng Hành chính - Quản trị',
    value: '(028) 38.505.520 (Máy lẻ: 115 / 116)',
  },
  {
    icon: <PhoneOutlined sx={{ fontSize: 24 }} />,
    label: 'Hotline Hỗ trợ KTX',
    value: '0902.992.306',
  },
  {
    icon: <EmailOutlined sx={{ fontSize: 24 }} />,
    label: 'Email Chăm sóc Sinh viên',
    value: 'ktx@stu.edu.vn',
  },
];

export default function ContactSection() {
  return (
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Paper
              variant="outlined"
              sx={{
                p: { xs: 3, md: 6 },
                borderRadius: 2,
                borderColor: 'divider',
                background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                color: 'common.white',
              }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: '-0.5px' }}>
                  Cần hỗ trợ?
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 400, mb: 0, lineHeight: 1.6, maxWidth: 440 }}>
                  Nếu bạn cần hỏi thêm về tình trạng phòng trống hoặc sự cố trong lúc đăng ký, hãy
                  liên hệ ngay với Ban quản lý KTX.
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="column" spacing={2}>
                  {CONTACT_METHODS.map((method, index) => (
                      <Stack
                          key={index}
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            p: 2.5,
                            borderRadius: 2,
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateX(4px)',
                              bgcolor: 'rgba(255, 255, 255, 0.15)',
                            },
                          }}
                      >
                        <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'rgba(255, 255, 255, 0.15)',
                              color: 'common.white',
                              flexShrink: 0,
                            }}
                        >
                          {method.icon}
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.2 }}>
                            {method.label}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
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