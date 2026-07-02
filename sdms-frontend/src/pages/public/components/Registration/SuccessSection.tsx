import { CheckCircle } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

export default function SuccessSection() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        mt: 6,
      }}
    >
      <CheckCircle color="success" sx={{ fontSize: 90 }} />

      <Typography variant="h4" sx={{ fontWeight: 900, textAlign: 'center', mt: 2 }}>
        Nộp Hồ Sơ Thành Công!
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          textAlign: 'center',
          maxWidth: 400,
          fontSize: '1.1rem',
        }}
      >
        Hồ sơ của bạn đã được ghi nhận vào hệ thống và đang chờ Ban Quản Lý xét duyệt. Bạn có thể
        tra cứu trạng thái hồ sơ tại bất kỳ thời điểm nào.
      </Typography>
    </Box>
  );
}
