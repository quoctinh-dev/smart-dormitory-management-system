import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';

const REGISTRATION_STEPS = [
  {
    label: 'Nộp hồ sơ & lưu tệp PDF',
    description:
        'Điền thông tin và tải lên minh chứng (CCCD, Ảnh 3x4). Hệ thống sẽ tự động sinh "Phiếu Đăng Ký" và "Bản Cam Kết". Bạn có thể tải ngay 2 tệp PDF này ở mục tra cứu để lưu trữ.',
  },
  {
    label: 'Chờ Ban quản lý xét duyệt',
    description:
        'Hồ sơ sẽ được Ban quản lý kiểm duyệt từ 1-3 ngày. Hãy theo dõi thường xuyên, nếu có sai sót, bạn sẽ được yêu cầu bổ sung. Khi hợp lệ, trạng thái chuyển sang CHỜ THANH TOÁN.',
  },
  {
    label: 'Thanh toán & Kích hoạt tài khoản',
    description:
        'Sinh viên có thể đóng phí trực tuyến (Online) hoặc bằng tiền mặt. Sau khi thanh toán thành công, hồ sơ chính thức ĐƯỢC DUYỆT. Lúc này, bạn đã có thể kích hoạt tài khoản sinh viên nội trú để đăng nhập hệ thống (lưu ý: chưa nhận phòng nên sẽ chưa thấy thông tin phòng).',
  },
  {
    label: 'Nhận phòng tại Ký túc xá',
    description:
        'Đến ngày hẹn, sinh viên tới làm thủ tục nhận phòng (check-in) trực tiếp với Ban quản lý. Sau khi hoàn tất, thông tin phòng ở sẽ được cập nhật đầy đủ trên ứng dụng để bạn bắt đầu sử dụng các tiện ích nội bộ!',
  },
];

export default function ProcessSection() {
  return (
      <Box
          sx={{
            py: 10,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc'),
          }}
      >
        <Container maxWidth="md">
          <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                textAlign: 'center',
                mb: 2,
                letterSpacing: '-0.5px'
              }}
          >
            Quy trình đăng ký nội trú
          </Typography>
          <Typography
              variant="h6"
              sx={{ color: 'text.secondary', textAlign: 'center', mb: 8, fontWeight: 400 }}
          >
            Minh bạch, rõ ràng - 4 bước đơn giản để trở thành cư dân
          </Typography>

          <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: 6,
                border: 1,
                borderColor: 'divider',
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'background.paper'
                        : 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                boxShadow: (theme) => theme.shadows[1],
              }}
          >
            <Stepper
                orientation="vertical"
                sx={{
                  '& .MuiStepConnector-root': { ml: 2.2 },
                  '& .MuiStepConnector-line': { borderColor: 'primary.light', borderLeftStyle: 'dashed', borderLeftWidth: 2 }
                }}
            >
              {REGISTRATION_STEPS.map((step, index) => (
                  <Step key={step.label} active={true}>
                    <StepLabel
                        StepIconComponent={() => (
                            <Box
                                sx={(theme) => ({
                                  width: 36,
                                  height: 36,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: 'primary.main',
                                  color: 'common.white',
                                  fontWeight: 700,
                                  fontSize: '0.95rem',
                                  boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)',
                                })}
                            >
                              {index + 1}
                            </Box>
                        )}
                        sx={{
                          '& .MuiStepLabel-label': {
                            mt: 0.5,
                          },
                        }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', pl: 0.5 }}>
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent
                        sx={{
                          ml: 2.2,
                          pl: 3,
                          borderLeft: '2px dashed',
                          borderColor: 'primary.light',
                          pb: index === REGISTRATION_STEPS.length - 1 ? 0 : 4
                        }}
                    >
                      <Typography
                          variant="body1"
                          sx={{
                            color: 'text.secondary',
                            mt: 1,
                            fontSize: '1rem',
                            lineHeight: 1.7,
                          }}
                      >
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