import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, Divider, Alert, CircularProgress, Snackbar } from '@mui/material';
import Grid from '@mui/material/Grid2';
import PaymentIcon from '@mui/icons-material/Payment';
import { alpha } from '@mui/material/styles';

import { usePayment } from '@/hooks/usePayment'; 
import CustomSkeleton from '@/components/common/CustomSkeleton';

export default function PaymentPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const {
    bill,
    application,
    loading,
    error,
    paying,
    snackbar,
    handleMockPayment,
    closeSnackbar,
  } = usePayment(applicationId);

  if (loading) return <CustomSkeleton type="dashboard" count={1} />;

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        variant="outlined" 
        sx={{ p: 4, borderRadius: 4, textAlign: 'center', boxShadow: (theme) => theme.shadows[3] }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
          Thanh Toán Lệ Phí
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Vui lòng hoàn tất thanh toán để hệ thống tự động cấp phòng và tạo tài khoản sinh viên nội trú cho bạn.
        </Typography>

        {/* THÔNG TIN SINH VIÊN */}
        <Box sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04), border: '1px solid', borderColor: 'divider', p: 3, borderRadius: 3, textAlign: 'left', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Thông tin sinh viên</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}><Typography sx={{ color: 'text.secondary' }}>Họ và tên:</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>{application?.fullName}</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography sx={{ color: 'text.secondary' }}>CCCD/CMND:</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>{application?.cccd}</Typography></Grid>
          </Grid>
        </Box>

        {/* THÔNG TIN HÓA ĐƠN */}
        <Box sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04), border: '1px solid', borderColor: 'divider', p: 3, borderRadius: 3, textAlign: 'left', mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Thông tin thanh toán</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}><Typography sx={{ color: 'text.secondary' }}>Mã hóa đơn:</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>{bill?.billId}</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography sx={{ color: 'text.secondary' }}>Nội dung:</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>{bill?.description}</Typography></Grid>
            <Grid size={{ xs: 6 }}><Typography sx={{ color: 'text.secondary' }}>Hạn chót nộp:</Typography></Grid>
            <Grid size={{ xs: 6 }}>
              <Typography sx={{ fontWeight: 'bold', textAlign: 'right', color: 'error.main' }}>
                {bill?.dueDate ? new Date(bill.dueDate).toLocaleDateString('vi-VN') : ''}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Grid container sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 6 }}><Typography variant="h6" sx={{ fontWeight: 600 }}>Tổng tiền:</Typography></Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'right', color: 'primary.main' }}>
                {bill?.amount ? bill.amount.toLocaleString('vi-VN') : 0} VNĐ
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Button 
          variant="contained" 
          size="large" 
          fullWidth 
          color="warning"
          startIcon={paying ? <CircularProgress size={20} color="inherit"/> : <PaymentIcon />}
          onClick={() => handleMockPayment(() => navigate('/status'))} // Truyền hành động callback chuyển hướng sau khi găm xong thông tin thành công
          disabled={paying}
          sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2, mb: 2 }}
        >
          {paying ? 'Đang xử lý giao dịch...' : 'Mô phỏng Đóng Tiền (Bỏ qua bước VNPay)'}
        </Button>
        
        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.85rem' }}>
          *Ghi chú: Nút này phục vụ môi trường kiểm thử (Test) luồng kiến trúc Event-Driven của hệ thống. Trong thực tế, cổng sẽ điều hướng sang cổng ký số VNPay Sandbox.
        </Typography>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}