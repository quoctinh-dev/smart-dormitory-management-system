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
    Stack,
} from '@mui/material';
import {useMemo} from 'react';
import {alpha} from '@mui/material/styles';

import {useRegistration} from '@/hooks/useRegistration';

import CommitmentSection from './components/Registration/CommitmentSection';
import DocumentUploadSection from './components/Registration/DocumentUploadSection';
import EligibilitySection from './components/Registration/EligibilitySection';
import InfoSection from './components/Registration/InfoSection';
import SuccessSection from './components/Registration/SuccessSection';

const STEP_LABELS = ['Kiểm tra', 'Thông tin', 'Hồ sơ', 'Cam kết', 'Hoàn tất'];

const REGISTRATION_TYPE_TEXT = {
    NEW_STUDENT: 'Dành cho tân sinh viên',
    CURRENT_RESIDENT: 'Dành cho cựu sinh viên đang lưu trú',
    OPEN_REGISTRATION: 'Đợt đăng ký tự do',
};

const NavigationControls = ({activeStep, loading, onNext, onBack}: any) => {
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
            <Button
                disabled={isBackDisabled}
                onClick={onBack}
                variant="outlined"
                color="inherit"
                sx={{borderRadius: 3, px: 3}}
            >
                Quay lại
            </Button>

            {activeStep < 4 ? (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onNext}
                    disabled={loading}
                    sx={{
                        minWidth: 140,
                        borderRadius: 3,
                        fontWeight: 700,
                        boxShadow: 'none',
                        '&:hover': {boxShadow: 'none'}
                    }}
                >
                    {nextButtonText}
                </Button>
            ) : (
                <Button
                    variant="contained"
                    color="primary"
                    href="/"
                    sx={{
                        minWidth: 140,
                        borderRadius: 3,
                        fontWeight: 700,
                        boxShadow: 'none',
                        '&:hover': {boxShadow: 'none'}
                    }}
                >
                    Về trang chủ
                </Button>
            )}
        </Box>
    );
};

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
        otpSent,
        otpCode,
        setOtpCode,
        handleRequestOtp,
        uploadedPreviews,
    } = useRegistration();

    const renderStepSection = useMemo(() => {
        switch (activeStep) {
            case 0:
                return (
                    <EligibilitySection
                        formData={formData}
                        setFormData={setFormData}
                        error={error}
                        otpSent={otpSent}
                        otpCode={otpCode}
                        setOtpCode={setOtpCode}
                        handleRequestOtp={handleRequestOtp}
                        loading={loading}
                    />
                );
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
                        uploadedDocs={uploadedDocs}
                        uploadedPreviews={uploadedPreviews}
                        handleUpload={handleUpload}
                        loading={loading}
                        formData={formData}
                        period={period}
                        targetGroup={targetGroup}
                    />
                );
            case 3:
                return <CommitmentSection formData={formData} setFormData={setFormData} error={error}/>;
            case 4:
                return <SuccessSection/>;
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
        uploadedPreviews,
        handleUpload,
        loading,
        setFormData,
        otpSent,
        otpCode,
        setOtpCode,
        handleRequestOtp,
    ]);

    const periodSubTitle = useMemo(() => {
        if (!period) return null;
        const typeText =
            (REGISTRATION_TYPE_TEXT as any)[period.registrationType] || period.registrationType;
        return `${period.periodName} (${typeText})`;
    }, [period]);

    return (
        <Container maxWidth="md" sx={{py: 8}}>
            <Fade in timeout={800}>
                <Paper
                    elevation={0}
                    sx={{
                        p: {xs: 4, md: 6},
                        borderRadius: 6,
                        minHeight: '600px',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.02)'
                    }}
                >
                    <Box sx={{mb: 5, textAlign: 'center'}}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                mb: 1.5,
                                color: 'text.primary',
                                lineHeight: 1.3
                            }}
                        >
                            Đăng ký nội trú
                        </Typography>
                        {periodSubTitle && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    fontWeight: 500,
                                    letterSpacing: '0.2px',
                                    opacity: 0.85
                                }}
                            >
                                {periodSubTitle}
                            </Typography>
                        )}
                    </Box>

                    <Stepper
                        activeStep={activeStep}
                        alternativeLabel
                        sx={{
                            mb: 6,
                            '& .MuiStepLabel-label': {fontWeight: 600, color: 'text.secondary', mt: 1},
                            '& .MuiStepLabel-label.Mui-active': {fontWeight: 700, color: 'primary.main'},
                            '& .MuiStepLabel-label.Mui-completed': {fontWeight: 600, color: 'text.primary'},
                            '& .MuiStepConnector-line': {borderColor: 'divider'},
                            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {borderColor: 'primary.main'},
                            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {borderColor: 'primary.main'}
                        }}
                    >
                        {STEP_LABELS.map((label, index) => (
                            <Step key={label}>
                                <StepLabel
                                    StepIconComponent={({active, completed}) => {
                                        const isCurrent = active;
                                        const isDone = completed;
                                        return (
                                            <Box
                                                sx={(theme) => ({
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: isDone || isCurrent ? 'primary.main' : 'background.elevation1',
                                                    color: isDone || isCurrent ? 'common.white' : 'text.secondary',
                                                    fontWeight: 700,
                                                    fontSize: '0.85rem',
                                                    border: isCurrent ? '2px solid' : '1px solid',
                                                    borderColor: isCurrent ? 'primary.light' : isDone ? 'primary.main' : 'divider',
                                                    boxShadow: isCurrent ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}` : 'none',
                                                    transition: 'all 0.2s ease'
                                                })}
                                            >
                                                {index + 1}
                                            </Box>
                                        );
                                    }}
                                >
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <Box sx={{flexGrow: 1}}>{renderStepSection}</Box>

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