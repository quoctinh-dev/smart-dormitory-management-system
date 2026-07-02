import { GavelRounded } from '@mui/icons-material';
import {
  Box,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

const COMMITMENT_CLAUSES = [
  {
    id: 1,
    content:
      'Không mua bán, tàng trữ và sử dụng ma túy; không hút thuốc lá trong ký túc xá; không xăm mình.',
    penalty: 'BUỘC RA KHỎI KÝ TÚC XÁ',
    severe: true,
  },
  {
    id: 2,
    content:
      'Không nấu ăn, đốt lửa trong phòng ở, hành lang, lan can và những nơi công cộng; không tàng trữ, sử dụng các dụng cụ đun nấu bằng điện, các chất dễ nổ, dễ cháy (pháo, xăng, dầu, cồn, than, củi, hóa chất).',
    penalty: 'BUỘC RA KHỎI KÝ TÚC XÁ',
    severe: true,
  },
  {
    id: 3,
    content:
      'Không chứa chấp người lưu trú trái quy định của KTX, tiếp người thân và bạn bè tại phòng khách (tầng trệt).',
    penalty: 'BUỘC RA KHỎI KÝ TÚC XÁ',
    severe: true,
  },
  {
    id: 4,
    content: 'Không nghịch phá hệ thống PCCC hoặc báo động giả trong KTX.',
    penalty: 'BUỘC RA KHỎI KÝ TÚC XÁ',
    severe: true,
  },
  {
    id: 5,
    content:
      'Không uống rượu bia, đánh bài, cá độ, ghi và chơi số đề; không tàng trữ, sử dụng và phát tán các tài liệu phim ảnh đồi trụy, phản động hoặc truy cập các trang WEB có nội dung xấu; không tàng trữ, sử dụng và phát tán các loại hung khí; không làm mất an ninh trật tự, làm mất vệ sinh môi trường.',
    penalty: 'BUỘC RA KHỎI KÝ TÚC XÁ',
    severe: true,
  },
  {
    id: 6,
    content:
      'Không đóng đinh, đục lỗ, viết, vẽ, dán giấy, tranh ảnh làm bẩn tường, trần nhà; ăn mặc lịch sự (không mặc quần cụt), tóc chải gọn gàng, quan hệ nam nữ lành mạnh. Sinh viên nam không lên khu vực của sinh viên nữ (lầu 1).',
    penalty: 'Xử lý theo Quy chế lưu trú',
    severe: false,
  },
  {
    id: 7,
    content:
      'Bảo quản tài sản, thiết bị của KTX, sử dụng đúng mục đích, đúng theo chức năng, mọi hư hỏng đều phải đền bù theo nguyên trạng.',
    penalty: 'Xử lý theo Quy chế lưu trú',
    severe: false,
  },
  {
    id: 8,
    content:
      'Không xâm phạm trái phép khu vực kho tàng, phòng làm việc, phòng SV khác, khu vực cấm người không có phận sự. Báo ngay cho BQL KTX khi phát hiện người lạ mặt hoặc hành vi phá hoại tài sản KTX.',
    penalty: 'Xử lý theo Quy chế lưu trú',
    severe: false,
  },
  {
    id: 9,
    content:
      'Giữ trật tự và tắt chuông điện thoại sau 22h00. Vệ sinh phòng theo lịch phân công và đổ rác đúng nơi quy định.',
    penalty: 'Xử lý theo Quy chế lưu trú',
    severe: false,
  },
  {
    id: 10,
    content:
      'Có nghĩa vụ và trách nhiệm thực hiện Quy chế lưu trú KTX; chấp hành việc sắp xếp chỗ ở theo quy định của KTX. Sinh viên tự chịu trách nhiệm và bảo quản tài sản cá nhân có giá trị (tiền, laptop, điện thoại, đồ trang sức...).',
    penalty: 'Xử lý theo Quy chế lưu trú',
    severe: false,
  },
  {
    id: 11,
    content:
      'Đeo thẻ lưu trú KTX trước khi ra vào KTX để tránh tình trạng người lạ xâm nhập vào KTX, sinh viên vi phạm sẽ bị xử lý theo quy chế.',
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
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 800, mx: 'auto', mt: 2 }}
    >
      {/* Tiêu đề */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          BẢN CAM KẾT LƯU TRÚ KÝ TÚC XÁ
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          (V/v thực hiện các nội quy, quy định tại Ký túc xá STU)
        </Typography>
      </Box>

      <Alert severity="warning" icon={<GavelRounded />} sx={{ borderRadius: 2 }}>
        Vui lòng <b>đọc kỹ toàn bộ</b> 11 điều khoản bên dưới trước khi xác nhận cam kết. Hệ thống
        sẽ sinh file PDF Bản Cam Kết tự động sau khi bạn xác nhận.
      </Alert>

      {/* Nội dung cam kết */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.main', px: 3, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
            11 Điều khoản cam kết thực hiện nghiêm chỉnh
          </Typography>
        </Box>

        <Box sx={{ maxHeight: 450, overflowY: 'auto', px: 3, py: 2 }}>
          {COMMITMENT_CLAUSES.map((clause) => (
            <Box key={clause.id} sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Chip
                  label={`Điều ${clause.id}`}
                  size="small"
                  color={clause.severe ? 'error' : 'default'}
                  sx={{ fontWeight: 'bold', minWidth: 70, mt: 0.3 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ textAlign: 'justify', lineHeight: 1.7 }}>
                    {clause.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontStyle: 'italic',
                      fontWeight: 'bold',
                      color: clause.severe ? 'error.main' : 'text.secondary',
                      display: 'block',
                      mt: 0.5,
                    }}
                  >
                    👉 Hình thức xử lý: {clause.penalty}
                  </Typography>
                </Box>
              </Box>
              {clause.id < COMMITMENT_CLAUSES.length && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Đoạn cam đoan cuối */}
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
          borderColor: (theme) => alpha(theme.palette.warning.main, 0.4),
        }}
      >
        <Typography
          variant="body2"
          sx={{ textAlign: 'justify', fontStyle: 'italic', color: 'text.secondary' }}
        >
          Tôi xin cam đoan đã đọc kỹ, hiểu rõ toàn bộ nội dung trên và cam kết thực hiện nghiêm
          chỉnh. Nếu vi phạm bất kỳ điều khoản nào, tôi xin hoàn toàn chịu các hình thức kỷ luật cao
          nhất từ Ban Quản lý Ký túc xá và Nhà trường, bao gồm cả việc buộc ra khỏi Ký túc xá ngay
          lập tức mà không khiếu nại.
        </Typography>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Nút xác nhận */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 1,
          p: 2,
          borderRadius: 3,
          border: '2px dashed',
          borderColor: (theme) => (isCommitted ? 'success.main' : 'text.disabled'),
          bgcolor: (theme) =>
            isCommitted ? alpha(theme.palette.success.main, 0.05) : 'transparent',
          borderStyle: isCommitted ? 'solid' : 'dashed',
          transition: 'all 0.3s ease',
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
              sx={{ fontWeight: 'bold', color: isCommitted ? 'success.main' : 'text.primary' }}
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
