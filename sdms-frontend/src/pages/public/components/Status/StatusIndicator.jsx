import { Box, Typography, Chip, Button, Alert } from "@mui/material";

export default function StatusIndicator({ status, applicationId }) {
    const getStatusConfig = () => {
        switch (status) {
            case 'PENDING': return { color: 'warning', label: 'Đang chờ duyệt' };
            case 'UNDER_REVIEW': return { color: 'warning', label: 'Đang xét duyệt' };
            case 'REQUEST_REVISION': return { color: 'error', label: 'Yêu cầu bổ sung hồ sơ' };
            case 'APPROVED': return { color: 'success', label: 'Đã hoàn tất thủ tục' };
            case 'WAITING_PAYMENT': return { color: 'info', label: 'Chờ thanh toán phí' };
            case 'REJECTED': return { color: 'error', label: 'Đã từ chối' };
            default: return { color: 'default', label: status };
        }
    };

    const config = getStatusConfig();

    return (
        <Box sx={{ textAlign: 'center', mb: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Trạng thái hồ sơ:</Typography>
            <Chip 
                label={config.label} 
                color={config.color} 
                sx={{ fontSize: '1.2rem', py: 2.5, px: 3, fontWeight: 'bold', mb: 2, borderRadius: 3 }}
            />
            
            {status === 'WAITING_PAYMENT' && (
                <Box mt={2}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        onClick={() => window.location.href = `/payment/${applicationId}`}
                        sx={{ borderRadius: 3, fontWeight: 'bold' }}
                    >
                        THANH TOÁN PHÍ LƯU TRÚ
                    </Button>
                </Box>
            )}
            
            {status === 'APPROVED' && (
                <Box mt={2}>
                    <Alert severity="success" sx={{ mb: 2, textAlign: 'left', borderRadius: 3 }}>
                        Hồ sơ và nghĩa vụ tài chính đã hoàn tất. Vui lòng tiến hành kích hoạt tài khoản định danh để truy cập hệ thống.
                    </Alert>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        size="large"
                        onClick={() => window.location.href = `/activate`}
                        sx={{ borderRadius: 3, fontWeight: 'bold' }}
                    >
                        TIẾN HÀNH KÍCH HOẠT TÀI KHOẢN
                    </Button>
                </Box>
            )}
        </Box>
    );
}
