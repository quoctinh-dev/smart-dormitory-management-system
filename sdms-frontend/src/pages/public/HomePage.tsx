// 📄 File: src/pages/public/HomePage.jsx
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Container,
  Button,
  Typography,
  TextField,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useMemo } from 'react';

import FeatureCard from '@/components/common/FeatureCard';
import useHome from '@/hooks/useHome';

import { AboutSection, CostSection, ProcessSection, ContactSection } from './components/Home';

export default function HomePage() {
  const {
    searchCccd,
    setSearchCccd,
    loading,
    dialogOpen,
    checkResult,
    handleCheckEligibility,
    handleCloseDialog,
    handleNavigateRegister,
  } = useHome();

  // TỐI ƯU HIỆU NĂNG: Bọc các section thông tin tĩnh vào useMemo để cô lập
  const renderedStaticSections = useMemo(
    () => (
      <>
        <AboutSection />
        <CostSection />
        <ProcessSection />
        <ContactSection />
      </>
    ),
    []
  );

  return (
    <Box>
      {/* HERO SECTION */}
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'common.white',
          pt: 12,
          pb: 20,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 800, letterSpacing: '-1px' }}>
            Hệ thống Quản lý Ký túc xá Thông minh
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 6, fontWeight: 300 }}>
            Nền tảng đăng ký, xét duyệt và quản lý lưu trú trực tuyến toàn diện.
          </Typography>

          {/* SEARCH BAR FOR ELIGIBILITY */}
          <Paper
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              maxWidth: 640,
              mx: 'auto',
              bgcolor: 'background.paper',
            }}
          >
            <TextField
              fullWidth
              placeholder="Nhập Mã định danh (CCCD/CMND) để tra cứu..."
              value={searchCccd}
              onChange={(e) => setSearchCccd(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckEligibility()}
              variant="standard"
              sx={{ px: 2 }}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleCheckEligibility}
              disabled={loading}
              sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 'bold', minWidth: '120px' }}
            >
              {loading ? 'Đang xử lý...' : 'Kiểm tra'}
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* ACTION CARDS */}
      <Container maxWidth="lg" sx={{ mt: -8, mb: 10, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<AssignmentIndIcon sx={{ fontSize: 48, color: 'primary.main' }} />}
              title="Đăng ký lưu trú"
              description="Tiếp nhận hồ sơ đăng ký nội trú trực tuyến đối với sinh viên đủ điều kiện."
              buttonText="Tiến hành nộp hồ sơ"
              to="/register"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'secondary.main' }} />}
              title="Tra cứu tiến độ"
              description="Theo dõi quy trình xét duyệt, cập nhật trạng thái thanh toán và thông tin phòng."
              buttonText="Tra cứu hồ sơ"
              to="/status"
              variant="outlined"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'success.main' }} />}
              title="Kích hoạt định danh"
              description="Khởi tạo tài khoản hệ thống dành cho sinh viên đã hoàn tất thủ tục lưu trú."
              buttonText="Thực hiện kích hoạt"
              to="/activate-account" // 🌟 FIX TẠI ĐÂY: Đồng bộ chính xác lộ trình sang đường dẫn mới
              variant="contained"
              color="success"
            />
          </Grid>
        </Grid>
      </Container>

      {/* RENDER KHỐI THÔNG TIN VỆ TINH ĐÃ ĐƯỢC CACHE MƯỢT MÀ */}
      {renderedStaticSections}

      {/* DIALOG KẾT QUẢ KIỂM TRA */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Kết quả kiểm tra điều kiện</DialogTitle>
        <DialogContent dividers>
          <Alert severity={checkResult.success ? 'success' : 'error'} variant="filled">
            {checkResult.message}
          </Alert>

          {checkResult.success && (
            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
              Hệ thống ghi nhận thông tin của bạn hoàn toàn hợp lệ. Vui lòng nhấn{' '}
              <strong>"Đăng ký ngay"</strong> để bắt đầu quá trình khai báo hồ sơ nội trú.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} color="inherit" variant="outlined">
            Đóng
          </Button>
          {checkResult.success && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNavigateRegister}
              sx={{ px: 3 }}
            >
              Đăng ký ngay
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
