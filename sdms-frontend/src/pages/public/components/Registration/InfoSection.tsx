import {
  Box,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Typography,
  Divider,
} from '@mui/material';

const PRIORITY_OPTIONS = [
  { value: 'PRIORITY_01', label: '1. Con liệt sĩ, con thương binh, bệnh binh...' },
  { value: 'PRIORITY_02', label: '2. Con đẻ người hoạt động kháng chiến nhiễm chất độc hóa học' },
  { value: 'PRIORITY_03', label: '3. Sinh viên dân tộc thiểu số' },
  { value: 'PRIORITY_04', label: '4. Hộ khẩu vùng khó khăn / Hộ nghèo' },
  { value: 'PRIORITY_05', label: '5. Khuyết tật / Mồ côi cả cha lẫn mẹ' },
  { value: 'PRIORITY_06', label: '6. Đảng viên / Bộ đội xuất ngũ' },
  { value: 'PRIORITY_07', label: '7. Tham gia hoạt động công tác xã hội' },
  { value: 'NONE', label: 'Không thuộc diện ưu tiên' },
];

import { SelectChangeEvent } from '@mui/material';

import { IRegistrationFormData } from '@/hooks/useRegistration';

interface InfoSectionProps {
  formData: IRegistrationFormData;
  error: string | null;
  setFormData: React.Dispatch<React.SetStateAction<IRegistrationFormData>>;
  period: any;
  targetGroup: string;
}

export default function InfoSection({ formData, error, setFormData }: InfoSectionProps) {
  const handleFieldChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev: IRegistrationFormData) => ({ ...prev, [field]: e.target.value }));
    };

  const handleNumberFieldChange =
    (field: string, maxLength?: number) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const onlyNums = e.target.value.replace(/[^0-9]/g, '');
      if (maxLength && onlyNums.length > maxLength) return;
      setFormData((prev: IRegistrationFormData) => ({ ...prev, [field]: onlyNums }));
    };

  const handlePriorityChange = (e: SelectChangeEvent<string>) => {
    setFormData((prev: IRegistrationFormData) => ({
      ...prev,
      priorityCategories: [e.target.value],
    }));
  };

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto', mt: 4 }}
    >
      <Alert severity="success" sx={{ borderRadius: 3 }}>
        Hệ thống xác nhận bạn đủ điều kiện nộp hồ sơ. Vui lòng cung cấp đầy đủ các thông tin cá nhân
        dưới đây.
      </Alert>
      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* ---------------- I. THÔNG TIN CÁ NHÂN ---------------- */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mt: 2 }}>
        I. Thông tin cá nhân
      </Typography>
      <Divider />

      <TextField
        label="Họ và tên"
        value={formData.fullName}
        onChange={handleFieldChange('fullName')}
        required
        fullWidth
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Mã số định danh (CCCD)"
          value={formData.cccd}
          disabled
          fullWidth
          sx={{ bgcolor: 'action.hover' }}
        />
        <TextField
          label="Ngày cấp CCCD"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={formData.issueDate || ''}
          onChange={handleFieldChange('issueDate')}
          fullWidth
        />
      </Box>

      <TextField
        label="Nơi cấp CCCD"
        value={formData.issuePlace || ''}
        onChange={handleFieldChange('issuePlace')}
        fullWidth
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Ngày sinh"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={formData.dob}
          onChange={handleFieldChange('dob')}
          required
          fullWidth
        />
        <TextField
          label="Giới tính"
          select
          slotProps={{ select: { native: true } }}
          value={formData.gender}
          onChange={handleFieldChange('gender')}
          required
          fullWidth
        >
          <option value="MALE">Nam</option>
          <option value="FEMALE">Nữ</option>
        </TextField>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Nơi sinh"
          value={formData.pob || ''}
          onChange={handleFieldChange('pob')}
          fullWidth
        />
        <TextField
          label="Khoa / Ngành học"
          value={formData.faculty || ''}
          onChange={handleFieldChange('faculty')}
          fullWidth
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Dân tộc"
          value={formData.ethnic || ''}
          onChange={handleFieldChange('ethnic')}
          fullWidth
        />
        <TextField
          label="Tôn giáo"
          value={formData.religion || ''}
          onChange={handleFieldChange('religion')}
          fullWidth
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Thư điện tử (Email)"
          type="email"
          value={formData.email}
          onChange={handleFieldChange('email')}
          required
          fullWidth
        />
        <TextField
          label="Số điện thoại di động"
          value={formData.phone}
          onChange={handleNumberFieldChange('phone', 10)} // Giới hạn đúng 10 số di động Việt Nam
          required
          fullWidth
        />
      </Box>

      <TextField
        label="Hộ khẩu thường trú"
        value={formData.permanentAddress}
        onChange={handleFieldChange('permanentAddress')}
        required
        fullWidth
      />
      <TextField
        label="Địa chỉ liên hệ hiện tại"
        value={formData.contactAddress}
        onChange={handleFieldChange('contactAddress')}
        required
        fullWidth
      />

      {/* ---------------- II. THÔNG TIN GIA ĐÌNH ---------------- */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mt: 3 }}>
        II. Thông tin gia đình
      </Typography>
      <Divider />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Họ và tên Cha"
          value={formData.fatherName || ''}
          onChange={handleFieldChange('fatherName')}
          fullWidth
        />
        <TextField
          label="Năm sinh"
          value={formData.fatherYob || ''}
          onChange={handleNumberFieldChange('fatherYob', 4)}
          sx={{ width: 120 }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Nghề nghiệp của Cha"
          value={formData.fatherJob || ''}
          onChange={handleFieldChange('fatherJob')}
          fullWidth
        />
        <TextField
          label="Số điện thoại Cha"
          value={formData.fatherPhone || ''}
          onChange={handleNumberFieldChange('fatherPhone', 10)}
          fullWidth
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <TextField
          label="Họ và tên Mẹ"
          value={formData.motherName || ''}
          onChange={handleFieldChange('motherName')}
          fullWidth
        />
        <TextField
          label="Năm sinh"
          value={formData.motherYob || ''}
          onChange={handleNumberFieldChange('motherYob', 4)}
          sx={{ width: 120 }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Nghề nghiệp của Mẹ"
          value={formData.motherJob || ''}
          onChange={handleFieldChange('motherJob')}
          fullWidth
        />
        <TextField
          label="Số điện thoại Mẹ"
          value={formData.motherPhone || ''}
          onChange={handleNumberFieldChange('motherPhone', 10)}
          fullWidth
        />
      </Box>

      <TextField
        label="Thông tin liên hệ khẩn cấp (Họ tên, SĐT, địa chỉ người thân)"
        value={formData.familyContact || ''}
        onChange={handleFieldChange('familyContact')}
        fullWidth
        sx={{ mt: 1 }}
      />

      {/* ---------------- III. ĐỐI TƯỢNG ƯU TIÊN ---------------- */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mt: 3 }}>
        III. Đối tượng ưu tiên
      </Typography>
      <Divider />

      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Lưu ý: Mức độ ưu tiên được sắp xếp giảm dần từ 1 đến 7. Nếu sinh viên thuộc nhiều diện ưu
        tiên, vui lòng chọn diện có số thứ tự <b>NHỎ NHẤT</b> (Ví dụ: thuộc cả diện 2 và 4 thì chọn
        diện 2).
      </Alert>

      <FormControl fullWidth required>
        <InputLabel>Diện ưu tiên (Chọn 1 diện cao nhất)</InputLabel>
        <Select
          value={formData.priorityCategories?.length > 0 ? formData.priorityCategories[0] : 'NONE'}
          onChange={handlePriorityChange}
          input={<OutlinedInput label="Diện ưu tiên (Chọn 1 diện cao nhất)" />}
        >
          {PRIORITY_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
