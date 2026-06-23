import React from 'react';
import { Container, Paper, Fade, Box, Stepper, Step, StepLabel, Typography, Button } from "@mui/material";
import { useRegistration } from "@/hooks/useRegistration";
import CustomSkeleton from "@/components/CustomSkeleton";

import EligibilitySection from './components/Registration/EligibilitySection';
import InfoSection from './components/Registration/InfoSection';
import DocumentUploadSection from './components/Registration/DocumentUploadSection';
import CommitmentSection from './components/Registration/CommitmentSection';
import SuccessSection from './components/Registration/SuccessSection';

const NavigationControls = ({ activeStep, loading, onNext, onBack }) => (
    <Box display="flex" justifyContent="space-between" mt={6} pt={3} borderTop="1px solid #f1f5f9">
        <Button 
            disabled={activeStep === 0 || loading || activeStep === 4} 
            onClick={onBack}
        >
            Quay lại
        </Button>
        {activeStep < 4 && (
            <Button 
                variant="contained" 
                color="primary" 
                onClick={onNext} 
                disabled={loading}
                sx={{ minWidth: 120 }}
            >
                {loading ? 'Đang xử lý...' : (activeStep === 3 ? 'Hoàn tất nộp hồ sơ' : 'Tiếp tục')}
            </Button>
        )}
        {activeStep === 4 && (
            <Button variant="contained" color="primary" href="/">
                Về trang chủ
            </Button>
        )}
    </Box>
);

// --- Main Page Component ---

export default function RegistrationPage() {
    const { activeStep, loading, error, period, formData, setFormData, uploadedDocs, handleNext, handleBack, handleUpload } = useRegistration();

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Fade in timeout={800}>
                <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: 6, minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h4" textAlign="center" fontWeight="900" mb={5}>
                        Đăng Ký Nội Trú
                    </Typography>
                    
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
                        {['Kiểm tra', 'Thông tin', 'Hồ sơ', 'Cam kết', 'Hoàn tất'].map(label => (
                            <Step key={label}><StepLabel>{label}</StepLabel></Step>
                        ))}
                    </Stepper>

                    <Box sx={{ flexGrow: 1 }}>
                        {activeStep === 0 && <EligibilitySection formData={formData} setFormData={setFormData} error={error} />}
                        {activeStep === 1 && <InfoSection period={period} formData={formData} setFormData={setFormData} error={error} />}
                        {activeStep === 2 && <DocumentUploadSection error={error} uploadedDocs={uploadedDocs} handleUpload={handleUpload} loading={loading} formData={formData} />}
                        {activeStep === 3 && <CommitmentSection formData={formData} setFormData={setFormData} error={error} />}
                        {activeStep === 4 && <SuccessSection />}
                    </Box>

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
