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
    label: 'Nộp Hồ sơ & Lưu File PDF',
    description:
      'Điền thông tin và tải lên minh chứng (CCCD, Ảnh 3x4). Hệ thống sẽ tự động sinh "Phiếu Đăng Ký" và "Bản Cam Kết". Bạn có thể tải ngay 2 file PDF này ở mục tra cứu để lưu trữ.',
  },
  {
    label: 'Chờ Ban Quản Lý Xét Duyệt',
    description:
      'Hồ sơ sẽ được Ban Quản Lý kiểm duyệt từ 1-3 ngày. Hãy theo dõi thường xuyên, nếu có sai sót, bạn sẽ được yêu cầu bổ sung. Khi hợp lệ, trạng thái chuyển sang CHỜ THANH TOÁN.',
  },
  {
    label: 'Nộp Tiền Mặt Tại Quầy',
    description:
      'Hiện tại, sinh viên vui lòng đến trực tiếp Văn phòng Ký túc xá để đóng phí lưu trú bằng tiền mặt. Sau khi Admin xác nhận thu tiền, hồ sơ chính thức ĐƯỢC DUYỆT (APPROVED) và phòng của bạn sẽ được chốt (Giữ chỗ thành công).',
  },
  {
    label: 'Check-in & Kích hoạt App',
    description:
      'Đến ngày chuyển vào, sinh viên tới KTX làm thủ tục Check-in nhận phòng với Trưởng/Phó phòng. Lúc này, bạn sẽ được cấp quyền truy cập vào Ứng dụng Sinh viên (Mobile App) để sử dụng các tiện ích nội bộ!',
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
        <Typography variant="h3" sx={{ fontWeight: 900, textAlign: 'center', mb: 2 }}>
          Quy trình Đăng ký Nội trú
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
            p: { xs: 3, md: 5 },
            borderRadius: 6,
            border: 1,
            borderColor: 'divider',
            background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
          }}
        >
          <Stepper orientation="vertical" sx={{ '& .MuiStepConnector-root': { ml: 1.4 } }}>
            {REGISTRATION_STEPS.map((step, index) => (
              <Step key={step.label} active={true}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={(theme) => ({
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: theme.palette.primary.main,
                        color: 'common.white',
                        fontWeight: 700,
                        fontSize: '0.95rem',
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
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent
                  sx={{ ml: 2.2, borderLeft: '2px dashed', borderColor: 'primary.light' }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      mb: 4,
                      mt: 1,
                      fontSize: '1.05rem',
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
