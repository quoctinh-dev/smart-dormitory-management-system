import {
  Box,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { IconifyIcon } from '@/components/base/IconifyIcon';

const COMMITMENT_CLAUSES = [
  {
    id: 1,
    content:
        'Cam kết không sử dụng ma túy, không hút thuốc lá và không thực hiện hành vi làm ảnh hưởng xấu đến môi trường sống trong ký túc xá.',
    penalty: 'BUỘC RA KHỎI KÝ TÚC XÁ',
    severe: true,
  },
  {
    id: 2,
    content:
        'Cam kết không tự ý nấu ăn, đốt lửa hoặc sử dụng chất dễ cháy, thiết bị gia nhiệt nguy hiểm trong phòng và khu vực chung.',
    penalty: 'BUỘC RA KHỎI KÝ TÚC XÁ',
    severe: true,
  },
  {
    id: 3,
    content:
        'Cam kết không tiếp người ngoài ở lại trái quy định và không vi phạm các quy định về chỗ ở, khách đến thăm.',
    penalty: 'BUỘC RA KHỎI KÝ TÚC XÁ',
    severe: true,
  },
  {
    id: 4,
    content:
        'Cam kết không phá hoại hệ thống phòng cháy chữa cháy, không làm giả báo động hoặc gây mất an toàn.',
    penalty: 'BUỘC RA KHỎI KÝ TÚC XÁ',
    severe: true,
  },
  {
    id: 5,
    content:
        'Cam kết không uống rượu bia, đánh bạc, lưu trữ hoặc phát tán tài liệu trái phép và không gây mất trật tự an ninh.',
    penalty: 'BUỘC RA KHỎI KÝ TÚC XÁ',
    severe: true,
  },
  {
    id: 6,
    content:
        'Cam kết giữ gìn vệ sinh, không làm bẩn tường, trần nhà, giữ thái độ ứng xử phù hợp và ăn mặc đúng quy định.',
    penalty: 'Xử lý theo Quy chế lưu trú',
    severe: false,
  },
  {
    id: 7,
    content:
        'Cam kết bảo quản tài sản và thiết bị của ký túc xá đúng mục đích; nếu có hư hỏng, chịu trách nhiệm bồi thường theo quy định.',
    penalty: 'Xử lý theo Quy chế lưu trú',
    severe: false,
  },
  {
    id: 8,
    content:
        'Cam kết không tự ý vào các khu vực cấm, không để người lạ xâm nhập và báo ngay cho ban quản lý khi phát hiện việc đáng ngờ.',
    penalty: 'Xử lý theo Quy chế lưu trú',
    severe: false,
  },
  {
    id: 9,
    content:
        'Cam kết giữ trật tự sau 22 giờ, tắt chuông điện thoại và thực hiện vệ sinh theo lịch phân công.',
    penalty: 'Xử lý theo Quy chế lưu trú',
    severe: false,
  },
  {
    id: 10,
    content:
        'Cam kết chấp hành quy chế lưu trú, thực hiện đúng phân công chỗ ở và tự bảo quản tài sản cá nhân có giá trị.',
    penalty: 'Xử lý theo Quy chế lưu trú',
    severe: false,
  },
  {
    id: 11,
    content: 'Cam kết đeo thẻ lưu trú khi ra vào ký túc xá để đảm bảo an ninh và quản lý nội bộ.',
    penalty: 'BUỘC RA KHỎI KÝ TÚC XÁ',
    severe: true,
  },
];

import { IRegistrationFormData } from '@/hooks/useRegistration';

interface CommitmentSectionProps {
  formData: IRegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<IRegistrationFormData>>;
  error: string | null;
}

export default function CommitmentSection({
                                            formData,
                                            setFormData,
                                            error,
                                          }: CommitmentSectionProps) {
  const isCommitted = formData.isCommitted || false;

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: IRegistrationFormData) => ({ ...prev, isCommitted: event.target.checked }));
  };

  return (
      <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 860, mx: 'auto', mt: 2 }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 1 }}
          >
            <IconifyIcon
                icon="mingcute:shield-check-fill"
                sx={{ color: 'primary.main', fontSize: 28 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              BẢN CAM KẾT LƯU TRÚ KÝ TÚC XÁ
            </Typography>
          </Stack>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            (V/v thực hiện các nội quy, quy định tại Ký túc xá STU)
          </Typography>
        </Box>

        <Alert
            severity="warning"
            icon={<IconifyIcon icon="mingcute:gavel-fill" />}
            sx={{
              borderRadius: 2,
              py: 1.25,
              boxShadow: 0,
              border: '1px solid',
              borderColor: 'warning.light',
              '& .MuiAlert-message': { width: '100%' },
            }}
        >
          <Typography variant="body2">
            Vui lòng <b>đọc kỹ toàn bộ</b> 11 điều khoản bên dưới trước khi xác nhận cam kết. Hệ thống
            sẽ sinh file PDF Bản Cam Kết tự động sau khi bạn xác nhận.
          </Typography>
        </Alert>

        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 1 }}>
          <Box sx={{ bgcolor: 'primary.main', px: 3, py: 1.6 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconifyIcon icon="mingcute:check-circle-line" sx={{ color: 'white', fontSize: 24 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>
                11 Điều khoản cam kết thực hiện nghiêm chỉnh
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ maxHeight: 460, overflowY: 'auto', px: { xs: 2, sm: 3 }, py: 2.2 }}>
            {COMMITMENT_CLAUSES.map((clause) => (
                <Box
                    key={clause.id}
                    sx={{
                      mb: 2.3,
                      p: 1.25,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                    <Chip
                        label={`Điều ${clause.id}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{
                          fontWeight: 700,
                          minWidth: 72,
                          mt: 0.25,
                          borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                          color: 'primary.main',
                        }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'justify', lineHeight: 1.7 }}>
                        {clause.content}
                      </Typography>
                      <Typography
                          variant="caption"
                          sx={{
                            fontStyle: 'italic',
                            fontWeight: 700,
                            color: 'text.secondary',
                            display: 'block',
                            mt: 0.5,
                          }}
                      >
                        Hình thức xử lý: {clause.penalty}
                      </Typography>
                    </Box>
                  </Box>
                  {clause.id < COMMITMENT_CLAUSES.length && (
                      <Divider sx={{ mt: 1.8, borderColor: 'divider' }} />
                  )}
                </Box>
            ))}
          </Box>
        </Paper>

        <Paper
            variant="outlined"
            sx={{
              p: 2.4,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.06),
              borderColor: (theme) => alpha(theme.palette.info.main, 0.25),
            }}
        >
          <Typography
              variant="body2"
              sx={{ textAlign: 'justify', lineHeight: 1.8, color: 'text.secondary' }}
          >
            Tôi xin cam đoan đã đọc kỹ, hiểu rõ toàn bộ nội dung trên và cam kết thực hiện nghiêm
            chỉnh. Nếu vi phạm bất kỳ điều khoản nào, tôi xin hoàn toàn chịu các hình thức kỷ luật cao
            nhất từ Ban Quản lý Ký túc xá và Nhà trường.
          </Typography>
        </Paper>

        {/* Hiển thị lỗi validation nếu có từ phía component cha */}
        {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
        )}

        <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 0.5,
              p: 2.2,
              borderRadius: 3,
              border: '2px solid',
              borderColor: error ? 'error.main' : isCommitted ? 'success.main' : 'divider',
              bgcolor: (theme) =>
                  error
                      ? alpha(theme.palette.error.main, 0.04)
                      : isCommitted
                          ? alpha(theme.palette.success.main, 0.07)
                          : alpha(theme.palette.grey[500], 0.04),
              transition: 'all 0.25s ease',
              boxShadow: isCommitted ? 1 : 0,
            }}
        >
          <FormControlLabel
              control={
                <Checkbox
                    checked={isCommitted}
                    onChange={handleCheckboxChange}
                    color="success"
                    size="large"
                />
              }
              label={
                <Typography
                    sx={{ fontWeight: 700, color: isCommitted ? 'success.main' : 'text.primary' }}
                >
                  Tôi xin cam đoan đã đọc kỹ, hiểu rõ toàn bộ nội quy và cam kết thực hiện nghiêm chỉnh
                  tất cả 11 điều khoản trên.
                </Typography>
              }
          />
        </Box>
      </Box>
  );
}