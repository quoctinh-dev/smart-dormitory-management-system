import { Container, Paper, Fade, Box, Stepper, Step, StepLabel, Typography } from "@mui/material";
import { useRegistration } from "@/hooks/useRegistration";
import CustomSkeleton from "@/components/CustomSkeleton"; // Đảm bảo đường dẫn đúng

export default function RegistrationPage() {
    const { activeStep, loading, period, ...logic } = useRegistration();

    // Hiển thị trạng thái Loading đồng bộ với toàn hệ thống
    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <CustomSkeleton type="form" />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Fade in timeout={800}>
                {/* Dùng borderRadius 6 (48px) như cũ để giữ style bo tròn mạnh */}
                <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: 6 }}>
                    <Typography variant="h4" textAlign="center" fontWeight="900" mb={5}>
                        Đăng Ký Nội Trú
                    </Typography>
                    
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 8 }}>
                        {['Kiểm tra', 'Thông tin', 'Hồ sơ', 'Hoàn tất'].map(label => (
                            <Step key={label}><StepLabel>{label}</StepLabel></Step>
                        ))}
                    </Stepper>

                    <Box sx={{ minHeight: '300px' }}>
                        {activeStep === 0 && <PeriodInfoSection period={period} />}
                        {activeStep === 1 && <IdentityFormSection {...logic} />}
                        {activeStep === 2 && <DocumentUploadSection {...logic} />}
                        {activeStep === 3 && <SuccessSection />}
                    </Box>

                    {/* NavigationControls: Đảm bảo truyền loading xuống để disable nút */}
                    <NavigationControls 
                        activeStep={activeStep} 
                        loading={loading} 
                        onNext={logic.handleNext} 
                    />
                </Paper>
            </Fade>
        </Container>
    );
}