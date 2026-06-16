import React from 'react';
import { Container, Paper, Fade, Box, Stepper, Step, StepLabel, Typography, TextField, Button, Alert, List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import { CheckCircle, CloudUpload, Description } from '@mui/icons-material';
import { useRegistration } from "@/hooks/useRegistration";
import CustomSkeleton from "@/components/CustomSkeleton";

// --- Sub-components cho các bước ---

const EligibilitySection = ({ formData, setFormData, error }) => (
    <Box display="flex" flexDirection="column" gap={3} maxWidth={400} mx="auto" mt={4}>
        <Typography variant="h6" textAlign="center" fontWeight="bold">
            Kiểm tra điều kiện đăng ký
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
            Vui lòng nhập số CCCD của bạn để hệ thống kiểm tra bạn có thuộc danh sách được đăng ký trong đợt này hay không.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
            label="Số CCCD"
            variant="outlined"
            value={formData.cccd}
            onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
            fullWidth
            required
        />
    </Box>
);

const InfoSection = ({ period, formData, error }) => (
    <Box display="flex" flexDirection="column" gap={3} maxWidth={500} mx="auto" mt={4}>
        <Alert severity="success" sx={{ borderRadius: 3 }}>
            Chúc mừng! Bạn đủ điều kiện tham gia đợt đăng ký này.
        </Alert>
        {error && <Alert severity="error">{error}</Alert>}
        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>Thông tin đợt đăng ký</Typography>
            <Typography variant="body1"><strong>Tên đợt:</strong> {period?.periodName}</Typography>
            <Typography variant="body1" mt={1}><strong>Loại đăng ký:</strong> {period?.registrationType === 'NEW_STUDENT' ? 'Tân sinh viên' : period?.registrationType === 'CURRENT_RESIDENT' ? 'Sinh viên đang lưu trú' : 'Mở tự do'}</Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>Thông tin sinh viên</Typography>
            <Typography variant="body1"><strong>Họ và tên:</strong> {formData.fullName || 'Không xác định'}</Typography>
            <Typography variant="body1" mt={1}><strong>CCCD:</strong> {formData.cccd}</Typography>
        </Paper>
        <Typography variant="body2" color="text.secondary" textAlign="center">
            Vui lòng kiểm tra kỹ thông tin trước khi tiếp tục.
        </Typography>
    </Box>
);

const DocumentUploadSection = ({ error, uploadedDocs, handleUpload, loading }) => (
    <Box display="flex" flexDirection="column" gap={3} maxWidth={500} mx="auto" mt={4}>
        <Typography variant="h6" textAlign="center" fontWeight="bold">
            Tải lên hồ sơ minh chứng
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        
        <Box 
            sx={{ 
                border: '2px dashed #cbd5e1', 
                borderRadius: 4, 
                p: 4, 
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: 'background.default',
                '&:hover': { bgcolor: '#f1f5f9' }
            }}
            component="label"
        >
            <input 
                type="file" 
                hidden 
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} 
                disabled={loading}
            />
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">Nhấn để tải lên tài liệu</Typography>
            <Typography variant="body2" color="text.secondary">Hỗ trợ JPG, PNG, PDF (Tối đa 5MB)</Typography>
        </Box>

        {uploadedDocs.length > 0 && (
            <List sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid #f1f5f9' }}>
                {uploadedDocs.map((doc, index) => (
                    <ListItem key={index}>
                        <ListItemIcon><Description color="primary" /></ListItemIcon>
                        <ListItemText primary={doc} />
                        <CheckCircle color="success" fontSize="small" />
                    </ListItem>
                ))}
            </List>
        )}
    </Box>
);

const SuccessSection = () => (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={6}>
        <CheckCircle color="success" sx={{ fontSize: 80 }} />
        <Typography variant="h5" fontWeight="bold" textAlign="center">
            Đăng ký thành công!
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={400}>
            Hồ sơ của bạn đã được gửi và đang chờ xét duyệt. Bạn có thể theo dõi trạng thái hồ sơ tại trang tra cứu.
        </Typography>
    </Box>
);

const NavigationControls = ({ activeStep, loading, onNext, onBack }) => (
    <Box display="flex" justifyContent="space-between" mt={6} pt={3} borderTop="1px solid #f1f5f9">
        <Button 
            disabled={activeStep === 0 || loading || activeStep === 3} 
            onClick={onBack}
        >
            Quay lại
        </Button>
        {activeStep < 3 && (
            <Button 
                variant="contained" 
                color="primary" 
                onClick={onNext} 
                disabled={loading}
                sx={{ minWidth: 120 }}
            >
                {loading ? 'Đang xử lý...' : (activeStep === 2 ? 'Hoàn tất' : 'Tiếp tục')}
            </Button>
        )}
        {activeStep === 3 && (
            <Button variant="contained" color="primary" href="/">
                Về trang chủ
            </Button>
        )}
    </Box>
);

// --- Main Page Component ---

export default function RegistrationPage() {
    const { activeStep, loading, error, period, formData, setFormData, uploadedDocs, handleNext, handleBack, handleUpload } = useRegistration();

    // CustomSkeleton cho form sẽ hiển thị khi chưa render DOM (nếu cần thiết kế SSR/CSR)
    // Nhưng vì hook chạy ở client, ta hiển thị loading riêng ở các nút

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Fade in timeout={800}>
                {/* Dùng borderRadius 6 (48px) như cũ để giữ style bo tròn mạnh */}
                <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: 6, minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h4" textAlign="center" fontWeight="900" mb={5}>
                        Đăng Ký Nội Trú
                    </Typography>
                    
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
                        {['Kiểm tra', 'Thông tin', 'Hồ sơ', 'Hoàn tất'].map(label => (
                            <Step key={label}><StepLabel>{label}</StepLabel></Step>
                        ))}
                    </Stepper>

                    <Box sx={{ flexGrow: 1 }}>
                        {activeStep === 0 && (
                            <EligibilitySection 
                                formData={formData} 
                                setFormData={setFormData} 
                                error={error} 
                            />
                        )}
                        {activeStep === 1 && (
                            <InfoSection 
                                period={period} 
                                formData={formData} 
                                error={error} 
                            />
                        )}
                        {activeStep === 2 && (
                            <DocumentUploadSection 
                                error={error} 
                                uploadedDocs={uploadedDocs} 
                                handleUpload={handleUpload} 
                                loading={loading} 
                            />
                        )}
                        {activeStep === 3 && <SuccessSection />}
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
