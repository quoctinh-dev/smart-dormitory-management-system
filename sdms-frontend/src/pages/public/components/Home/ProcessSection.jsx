import { Box, Container, Typography, Paper, Stepper, Step, StepLabel, StepContent } from '@mui/material';

const REGISTRATION_STEPS = [
  {
    label: 'Nộp Hồ sơ Trực tuyến',
    description: 'Điền phiếu đăng ký trên Web App. Tải lên ảnh chụp CCCD, Ảnh 3x4, Giấy chứng nhận ưu tiên (nếu có) và Bản cam kết điện tử. Không cần gửi qua bưu điện hay email như trước đây!',
  },
  {
    label: 'Chờ Xét duyệt & Thanh toán',
    description: 'Tra cứu trạng thái hồ sơ trên hệ thống. Khi trạng thái chuyển sang ĐƯỢC DUYỆT (WAITING_PAYMENT), tiến hành đóng tiền lưu trú thông qua cổng thanh toán.',
  },
  {
    label: 'Kích hoạt Định danh & Nhận phòng',
    description: 'Hệ thống tự động xếp giường. Sinh viên thiết lập mật khẩu tài khoản và đến văn phòng Ban Quản lý để quét khuôn mặt, nhận chìa khóa dọn vào ở.',
  },
];

export default function ProcessSection() {
  return (
    <Box sx={{ py: 10, bgcolor: (theme) => `rgba(${theme.palette.primary.main}, 0.03)` || 'background.default' }}>
      <Container maxWidth="md">
        <Typography variant="h3" sx={{ fontWeight: 900, textAlign: 'center', mb: 2 }}>
          Quy trình Đăng ký Mới
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: 'text.secondary', textAlign: 'center', mb: 8, fontWeight: 400 }}
        >
          Nhanh chóng, minh bạch và hoàn toàn trực tuyến 100%
        </Typography>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 5, 
            borderRadius: 6, 
            border: 1, 
            borderColor: 'divider' 
          }}
        >
          <Stepper orientation="vertical">
            {REGISTRATION_STEPS.map((step, index) => (
              <Step key={step.label} active={true}>
                <StepLabel>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                    Bước {index + 1}: {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, mt: 1, fontSize: '1.1rem', lineHeight: 1.6 }}>
                    {step.description}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Container>
    </Box>
  );
}