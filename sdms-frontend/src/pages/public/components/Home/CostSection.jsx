import { AttachMoney, FlashOn, ReceiptLong } from '@mui/icons-material';
import { Box, Container, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import Grid from '@mui/material/Grid2';

const COST_ITEMS = [
  {
    icon: <AttachMoney color="success" sx={{ fontSize: 32 }} />,
    title: 'Lệ phí phòng: ~ 350.000 VNĐ/tháng',
    desc: 'Thu theo đợt (thường vài tháng/lần tùy thông báo). Mức giá có thể điều chỉnh nhẹ theo năm học.',
  },
  {
    icon: <FlashOn color="warning" sx={{ fontSize: 32 }} />,
    title: 'Tiền điện sinh hoạt',
    desc: 'Chưa bao gồm trong giá phòng. Sinh viên tự thanh toán hàng tháng dựa trên chỉ số đồng hồ điện riêng.',
  },
  {
    icon: <ReceiptLong color="primary" sx={{ fontSize: 32 }} />,
    title: 'Thanh toán Trực tuyến',
    desc: 'Hệ thống hỗ trợ đóng phí tự động qua cổng thanh toán VNPay tiện lợi, nhanh chóng.',
  },
];

export default function CostSection() {
  return (
    <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
      <Container>
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 3 }}>
              Chi phí Lưu trú
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}
            >
              Trường Đại học Công nghệ Sài Gòn (STU) luôn hỗ trợ mức phí tốt nhất để tạo điều kiện sinh hoạt và học tập cho sinh viên.
            </Typography>

            <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {COST_ITEMS.map((item, index) => (
                <ListItem 
                  key={index} 
                  sx={{ bgcolor: 'background.default', borderRadius: 3, p: 2 }} // TỐI ƯU: Thay '#f8fafc' bằng token hệ thống
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={<Typography sx={{ fontWeight: 'bold' }} variant="h6">{item.title}</Typography>}
                    secondary={item.desc}
                  />
                </ListItem>
              ))}
            </List>

            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 3, fontStyle: 'italic' }}>
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
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
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
                <Typography variant="h4" sx={{ color: 'common.white', fontWeight: 'bold', opacity: 0.8 }}>
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