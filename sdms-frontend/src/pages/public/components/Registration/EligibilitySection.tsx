import { Box, Typography, TextField, Button } from '@mui/material';
import React from 'react';

interface EligibilitySectionProps {
  formData: { email: string; cccd: string; [key: string]: any };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  error: string | null;
  otpSent: boolean;
  otpCode: string;
  setOtpCode: React.Dispatch<React.SetStateAction<string>>;
  handleRequestOtp: () => Promise<void>;
  loading: boolean;
}

export default function EligibilitySection({
  formData,
  setFormData,
  error,
  otpSent,
  otpCode,
  setOtpCode,
  handleRequestOtp,
  loading,
}: EligibilitySectionProps) {
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: any) => ({ ...prev, email: e.target.value }));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpCode(e.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: 400,
        mx: 'auto',
        mt: 4,
      }}
    >
      <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        Xác thực Email & Kiểm tra điều kiện
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
        Vui lòng nhập Email trường cấp để hệ thống gửi mã xác thực (OTP) trước khi tiến hành tạo đơn
        đăng ký.
      </Typography>

      <TextField
        label="Địa chỉ Email"
        variant="outlined"
        type="email"
        value={formData.email || ''}
        onChange={handleEmailChange}
        fullWidth
        required
        disabled={otpSent}
        autoFocus={!otpSent}
        placeholder="VD: dh52201580@student.stu.edu.vn"
      />

      {!otpSent ? (
        <Button
          variant="outlined"
          color="primary"
          onClick={handleRequestOtp}
          disabled={loading || !formData.email}
          sx={{ mt: 1 }}
        >
          {loading ? 'Đang gửi...' : 'Nhận mã OTP'}
        </Button>
      ) : (
        <TextField
          label="Mã OTP"
          variant="outlined"
          value={otpCode}
          onChange={handleOtpChange}
          fullWidth
          required
          autoFocus
          placeholder="Nhập 6 số mã xác thực"
          error={!!error}
          helperText={error ? error : "Bấm 'Tiếp tục' sau khi điền xong OTP."}
          slotProps={{
            htmlInput: {
              maxLength: 6,
              inputMode: 'numeric',
            },
          }}
        />
      )}
    </Box>
  );
}
