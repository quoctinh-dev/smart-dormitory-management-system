// 📄 File: src/pages/public/HomePage.jsx
import AppRegistrationRoundedIcon from '@mui/icons-material/AppRegistrationRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import {
  Box,
  Container,
  Button,
  Typography,
  TextField,
  Paper,
  InputAdornment,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useMemo } from 'react';

import FeatureCard from '@/components/common/FeatureCard';
import useHome from '@/hooks/useHome';

import { AboutSection, CostSection, ProcessSection, ContactSection } from './components/Home';

export default function HomePage() {
  const { searchEmail, setSearchEmail, handleNavigateRegister } = useHome();

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
          <Chip
            label="Cổng đăng ký lưu trú trực tuyến"
            sx={{
              mb: 2.5,
              px: 1.5,
              py: 0.8,
              borderRadius: 999,
              bgcolor: 'rgba(255,255,255,0.16)',
              color: 'common.white',
              border: '1px solid rgba(255,255,255,0.22)',
              fontWeight: 'bold',
            }}
          />
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 'bold', letterSpacing: '-1px' }}>
            Hệ thống đăng ký Ký túc xá STU
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 6 }}>
            Nền tảng nộp hồ sơ, xét duyệt và tra cứu kết quả nội trú nhanh chóng dành cho sinh viên Trường Đại học Công nghệ Sài Gòn.
          </Typography>

          {/* SEARCH BAR FOR ELIGIBILITY */}
          <Paper
            elevation={3}
            sx={{
              p: 1.5,
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
              placeholder="Nhập Email để bắt đầu đăng ký..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNavigateRegister()}
              variant="standard"
              sx={{ px: 2 }}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleNavigateRegister}
              sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 'bold', minWidth: '120px' }}
            >
              Bắt đầu
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* ACTION CARDS */}
      <Container maxWidth="lg" sx={{ mt: -8, mb: 10, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<AppRegistrationRoundedIcon sx={{ fontSize: 32 }} />}
              title="Đăng ký lưu trú"
              description="Tiếp nhận hồ sơ đăng ký nội trú trực tuyến đối với sinh viên đủ điều kiện."
              buttonText="Tiến hành nộp hồ sơ"
              to="/register"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<FactCheckRoundedIcon sx={{ fontSize: 32 }} />}
              title="Tra cứu tiến độ"
              description="Theo dõi quy trình xét duyệt, cập nhật trạng thái thanh toán và thông tin phòng."
              buttonText="Tra cứu hồ sơ"
              to="/status"
              variant="outlined"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<VerifiedUserRoundedIcon sx={{ fontSize: 32 }} />}
              title="Kích hoạt định danh"
              description="Khởi tạo tài khoản hệ thống dành cho sinh viên đã hoàn tất thủ tục lưu trú."
              buttonText="Thực hiện kích hoạt"
              to="/activate-account"
              variant="contained"
              color="success"
            />
          </Grid>
        </Grid>
      </Container>

      {/* RENDER KHỐI THÔNG TIN VỆ TINH ĐÃ ĐƯỢC CACHE MƯỢT MÀ */}
      {renderedStaticSections}
    </Box>
  );
}
