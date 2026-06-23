import { Box, Typography, TextField, Alert } from '@mui/material';

export default function EligibilitySection({ formData, setFormData, error }) {
  
  const handleCccdChange = (e) => {
    const rawValue = e.target.value;
    const onlyNums = rawValue.replace(/[^0-9]/g, ''); 
    
    setFormData((prev) => ({ ...prev, cccd: onlyNums }));
  };

  const currentLength = formData.cccd?.length || 0;
  const isLengthInvalid = currentLength > 0 && currentLength !== 9 && currentLength !== 12;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 3, 
        maxWidth: 400, 
        mx: 'auto', 
        mt: 4 
      }}
    >
      <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        Kiểm tra điều kiện đăng ký
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
        Vui lòng nhập Mã số định danh (CCCD/CMND) để hệ thống đối chiếu điều kiện tham gia đợt tiếp nhận hồ sơ hiện hành.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        label="Mã số định danh (CCCD/CMND)"
        variant="outlined"
        value={formData.cccd}
        onChange={handleCccdChange}
        fullWidth
        required
        autoFocus
        placeholder="VD: 079200123456"
        error={isLengthInvalid} 
        helperText={
          isLengthInvalid 
            ? `Độ dài hiện tại: ${currentLength} số (Mã hợp lệ phải gồm đúng 9 hoặc 12 chữ số).` 
            : 'Hệ thống chấp nhận CMND cũ (9 số) hoặc CCCD mới (12 số).'
        }
        slotProps={{
          htmlInput: {
            maxLength: 12, 
            inputMode: 'numeric',   
          },
        }}
      />
    </Box>
  );
}