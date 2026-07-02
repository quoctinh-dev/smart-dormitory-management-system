import {
  Container,
  Paper,
  Fade,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
} from '@mui/material';
import { useMemo } from 'react';

import { useRegistration } from '@/hooks/useRegistration';

import CommitmentSection from './components/Registration/CommitmentSection';
import DocumentUploadSection from './components/Registration/DocumentUploadSection';
import EligibilitySection from './components/Registration/EligibilitySection';
import InfoSection from './components/Registration/InfoSection';
import SuccessSection from './components/Registration/SuccessSection';

const STEP_LABELS = ['Kiểm tra', 'Thông tin', 'Hồ sơ', 'Cam kết', 'Hoàn tất'];

// Đưa cấu hình tĩnh ra ngoài scope của component để tiết kiệm RAM khi re-render
const PRIORITY_LABELS = {
  NONE: 'Không thuộc diện ưu tiên',
  POOR_HOUSEHOLD: 'Hộ nghèo / Hộ cận nghèo',
  WAR_INVALIDS_CHILD: 'Con thương binh / Liệt sĩ',
  ETHNIC_MINORITY: 'Sinh viên dân tộc thiểu số',
  DISABLED: 'Sinh viên khuyết tật',
};

const REGISTRATION_TYPE_TEXT = {
  NEW_STUDENT: 'Dành cho Tân Sinh Viên',
  CURRENT_RESIDENT: 'Dành cho Cựu Sinh Viên Đang Lưu Trú',
  OPEN_REGISTRATION: 'Đợt Đăng Ký Tự Do',
};

// --- Sub-component: Thanh điều hướng (Đảm bảo single-responsibility) ---
const NavigationControls = ({ activeStep, loading, onNext, onBack }: any) => {
  const isBackDisabled = activeStep === 0 || loading || activeStep === 4;

  const nextButtonText = useMemo(() => {
    if (loading) return 'Đang xử lý...';
    return activeStep === 3 ? 'Hoàn tất nộp hồ sơ' : 'Tiếp tục';
  }, [loading, activeStep]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mt: 6,
        pt: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Button disabled={isBackDisabled} onClick={onBack}>
        Quay lại
      </Button>

      {activeStep < 4 ? (
        <Button
          variant="contained"
          color="primary"
          onClick={onNext}
          disabled={loading}
          sx={{ minWidth: 140 }}
        >
          {nextButtonText}
        </Button>
      ) : (
        <Button variant="contained" color="primary" href="/">
          Về trang chủ
        </Button>
      )}
    </Box>
  );
};

// --- Main Page Component ---
export default function RegistrationPage() {
  const {
    activeStep,
    loading,
    error,
    period,
    targetGroup,
    formData,
    setFormData,
    uploadedDocs,
    handleNext,
    handleBack,
    handleUpload,
  } = useRegistration();

  // CHUẨN HÓA LOGIC RENDER: Rút sạch các hàm set hoặc biến không đổi ra khỏi dependency
  const renderStepSection = useMemo(() => {
    switch (activeStep) {
      case 0:
        return <EligibilitySection formData={formData} setFormData={setFormData} error={error} />;
      case 1:
        return (
          <InfoSection
            period={period}
            targetGroup={targetGroup}
            formData={formData}
            setFormData={setFormData}
            error={error}
          />
        );
      case 2:
        return (
          <DocumentUploadSection
            error={error}
            uploadedDocs={uploadedDocs}
            handleUpload={handleUpload}
            loading={loading}
            formData={formData}
          />
        );
      case 3:
        return <CommitmentSection formData={formData} setFormData={setFormData} error={error} />;
      case 4:
        return <SuccessSection />;
      default:
        return null;
    }
  }, [
    activeStep,
    error,
    formData,
    period,
    targetGroup,
    uploadedDocs,
    handleUpload,
    loading,
    setFormData,
  ]);

  // Caching text header, không tính toán chuỗi rỗng khi điền Form
  const periodSubTitle = useMemo(() => {
    if (!period) return null;
    const typeText =
      (REGISTRATION_TYPE_TEXT as any)[period.registrationType] || period.registrationType;
    return `${period.periodName} (${typeText})`;
  }, [period]);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Fade in timeout={800}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 6,
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 900, mb: 1 }}>
            Đăng Ký Nội Trú
          </Typography>

          {periodSubTitle && (
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 4 }}
            >
              {periodSubTitle}
            </Typography>
          )}

          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{ mb: 6, mt: periodSubTitle ? 0 : 3 }}
          >
            {STEP_LABELS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* AREA RENDER DYNAMIC SECTION */}
          <Box sx={{ flexGrow: 1 }}>{renderStepSection}</Box>

          {/* Sử dụng trực tiếp hàm từ custom hook để đảm bảo đồng bộ luồng kiểm tra dữ liệu nghiêm ngặt */}
          <NavigationControls
            activeStep={activeStep}
            loading={loading}
            onNext={handleNext}
            onBack={handleBack}
          />
        </Paper>
      </Fade>
    </Container>
  );
}
