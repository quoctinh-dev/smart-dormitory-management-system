import { PaymentsOutlined, BoltOutlined, ReceiptLongOutlined } from '@mui/icons-material';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';

const COST_ITEMS = [
  {
    icon: <PaymentsOutlined sx={{ fontSize: 24 }} />,
    title: 'Lệ phí phòng: ~ 350.000 VNĐ/tháng',
    desc: 'Thu theo đợt (thường vài tháng/lần tùy thông báo). Mức giá có thể điều chỉnh nhẹ theo năm học.',
  },
  {
    icon: <BoltOutlined sx={{ fontSize: 24 }} />,
    title: 'Tiền điện sinh hoạt',
    desc: 'Chưa bao gồm trong giá phòng. Sinh viên tự thanh toán hàng tháng dựa trên chỉ số đồng hồ điện riêng.',
  },
  {
    icon: <ReceiptLongOutlined sx={{ fontSize: 24 }} />,
    title: 'Thanh toán linh hoạt',
    desc: 'Hệ thống hỗ trợ sinh viên thanh toán phí lưu trú trực tuyến (Online qua mã QR) hoặc nộp tiền mặt trực tiếp tại Văn phòng Ký túc xá.',
  },
];

export default function CostSection() {
  return (
      <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.5px' }}>
                Chi phí lưu trú
              </Typography>
              <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', mb: 4, fontSize: '1.05rem', lineHeight: 1.8 }}
              >
                Trường Đại học Công nghệ Sài Gòn (STU) luôn áp dụng mức phí tối ưu nhất nhằm hỗ trợ
                và tạo điều kiện thuận lợi cho đời sống sinh hoạt, học tập của sinh viên.
              </Typography>

              <Stack direction="column" spacing={2}>
                {COST_ITEMS.map((item, index) => (
                    <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 4,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.default',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: (theme) => theme.shadows[1],
                          },
                        }}
                    >
                      <Stack direction="row" spacing={2.2} alignItems="flex-start">
                        <Box
                            sx={(theme) => ({
                              width: 44,
                              height: 44,
                              borderRadius: 2.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              color: 'primary.main',
                              flexShrink: 0,
                            })}
                        >
                          {item.icon}
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700 }} variant="h6">
                            {item.title}
                          </Typography>
                          <Typography sx={{ color: 'text.secondary', lineHeight: 1.6, mt: 0.5, fontSize: '0.95rem' }}>
                            {item.desc}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                ))}
              </Stack>

              <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mt: 3, fontStyle: 'italic' }}
              >
                * Lưu ý: Sinh viên cần tự chuẩn bị các vật dụng cá nhân khi dọn vào ở.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                  elevation={0}
                  sx={{
                    p: 0,
                    borderRadius: 6,
                    overflow: 'hidden',
                    boxShadow: (theme) => theme.shadows[4],
                  }}
              >
                <Box
                    sx={{
                      height: 450,
                      background: (theme) =>
                          `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                >
                  <Typography
                      variant="h4"
                      sx={{ color: 'common.white', fontWeight: 800, opacity: 0.85, letterSpacing: '0.5px' }}
                  >
                    STU Dormitory
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
  );
}