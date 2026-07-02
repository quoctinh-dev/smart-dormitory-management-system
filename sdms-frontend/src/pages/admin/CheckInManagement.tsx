import { Search, HowToReg, Hotel, VpnKey } from '@mui/icons-material';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';

import { useCheckIn } from '@/hooks/useCheckIn';

export default function CheckInManagement() {
  const {
    cccd,
    setCccd,
    loading,
    checkInLoading,
    error,
    studentData,
    successMsg,
    handleSearch,
    handleCheckIn,
  } = useCheckIn();

  // TỐI ƯU UX: Bộ lọc đầu vào sạch, chỉ cho phép gõ số
  const handleCccdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    setCccd(onlyNums);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getImageUrl = (path: string | undefined): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL}${path}`;
  };

  const currentLength = cccd.length;
  const isLengthInvalid = currentLength > 0 && currentLength !== 9 && currentLength !== 12;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Quầy Lễ Tân: Nhận Phòng (Check-in)
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
          Tìm kiếm sinh viên bằng CCCD để đối chiếu khuôn mặt và hoàn tất thủ tục nhận phòng.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* CỘT TRÁI: TÌM KIẾM */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, height: '100%' }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Search color="primary" /> Tra cứu sinh viên
            </Typography>

            <TextField
              fullWidth
              label="Mã số định danh (CCCD/CMND)"
              variant="outlined"
              value={cccd}
              onChange={handleCccdChange}
              onKeyDown={handleKeyDown}
              placeholder="VD: 079200123456"
              error={isLengthInvalid}
              helperText={
                isLengthInvalid ? `Độ dài: ${currentLength} số (Yêu cầu 9 hoặc 12 số).` : ''
              }
              autoFocus
              slotProps={{ htmlInput: { maxLength: 12, inputMode: 'numeric' } }}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
              onClick={handleSearch}
              disabled={loading || !cccd || isLengthInvalid}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Tìm Kiếm'}
            </Button>

            {error && (
              <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            {successMsg && (
              <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
                {successMsg}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* CỘT PHẢI: KẾT QUẢ VÀ HÀNH ĐỘNG */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 4,
              height: '100%',
              minHeight: 400,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!studentData ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexGrow: 1,
                  opacity: 0.5,
                }}
              >
                <HowToReg sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6">Chưa có thông tin tra cứu</Typography>
                <Typography variant="body2">
                  Vui lòng nhập số định danh chuẩn ở khung bên trái
                </Typography>
              </Box>
            ) : (
              <Box sx={{ animation: 'fadeIn 0.5s' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    mb: 3,
                    color: 'primary.main',
                    borderBottom: '2px solid',
                    borderColor: 'primary.light',
                    pb: 1,
                    display: 'inline-block',
                  }}
                >
                  Kết Quả Đối Chiếu
                </Typography>

                <Grid container spacing={4}>
                  {/* Ảnh chân dung */}
                  <Grid
                    size={{ xs: 12, sm: 4 }}
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <Avatar
                      variant="rounded"
                      src={getImageUrl(studentData.portraitUrl)}
                      sx={{
                        width: 150,
                        height: 200,
                        mb: 2,
                        border: '4px solid',
                        borderColor: 'background.paper',
                        boxShadow: 3,
                      }}
                    >
                      Chưa có ảnh
                    </Avatar>
                    <Chip
                      label="Ảnh gốc hồ sơ"
                      color="info"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Grid>

                  {/* Thông tin chi tiết */}
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {studentData.studentName}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                      MSSV: <strong>{studentData.studentCode}</strong> | CCCD:{' '}
                      <strong>{studentData.cccd}</strong>
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                      Giới tính: <strong>{studentData.gender === 'MALE' ? 'Nam' : 'Nữ'}</strong>
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    {/* KHỐI PHÒNG ĐƯỢC CẤP CHUẨN ĐỘNG THEO THEME */}
                    <Box
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.05),
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: 'success.dark',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Hotel fontSize="small" /> Vị trí phòng ở được cấp:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '1.1rem' }}
                      >
                        {studentData.buildingName} - {studentData.floorName} - Phòng{' '}
                        {studentData.roomName}
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 900, mt: 1 }}>
                        GIƯỜNG SỐ: {studentData.bedName}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      size="large"
                      startIcon={<VpnKey />}
                      sx={{ mt: 4, py: 2, fontSize: '1.2rem', borderRadius: 3, fontWeight: 'bold' }}
                      onClick={handleCheckIn}
                      disabled={checkInLoading}
                    >
                      {checkInLoading ? 'Đang xử lý...' : 'Xác Nhận Nhận Phòng (Check-in)'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
