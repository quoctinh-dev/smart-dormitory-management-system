import PaymentIcon from '@mui/icons-material/Payment';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { usePayment } from '@/hooks/usePayment';

export default function PaymentPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const {
    bill,
    application,
    paymentInstructions, // Get payment instructions from the hook
    loading,

    paying,

    handleMockPayment,
  } = usePayment(applicationId);

  if (loading) return <CustomSkeleton type="dashboard" count={1} />;

  // Construct transfer content
  const transferContent = paymentInstructions?.contentPrefix
    ? `${paymentInstructions.contentPrefix}${application?.cccd}`
    : application?.cccd;

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
          Vui lòng hoàn tất thanh toán để hệ thống tự động cấp phòng và tạo tài khoản sinh viên nội
          trú cho bạn.
        </Typography>

        {/* THÔNG TIN SINH VIÊN */}
        <Box
          sx={{
            bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
            border: '1px solid',
            borderColor: 'divider',
            p: 3,
            borderRadius: 3,
            textAlign: 'left',
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Thông tin sinh viên
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography sx={{ color: 'text.secondary' }}>Họ và tên:</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                {application?.fullName}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography sx={{ color: 'text.secondary' }}>CCCD/CMND:</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                {application?.cccd}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* THÔNG TIN HÓA ĐƠN */}
        <Box
          sx={{
            bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
            border: '1px solid',
            borderColor: 'divider',
            p: 3,
            borderRadius: 3,
            textAlign: 'left',
            mb: 4,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Thông tin thanh toán
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography sx={{ color: 'text.secondary' }}>Mã hóa đơn:</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                {bill?.billId}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography sx={{ color: 'text.secondary' }}>Nội dung:</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                {bill?.description}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography sx={{ color: 'text.secondary' }}>Hạn chót nộp:</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography sx={{ fontWeight: 'bold', textAlign: 'right', color: 'error.main' }}>
                {bill?.dueDate ? new Date(bill.dueDate).toLocaleDateString('vi-VN') : ''}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Grid container sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tổng tiền:
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', textAlign: 'right', color: 'primary.main' }}
              >
                {bill?.amount ? bill.amount.toLocaleString('vi-VN') : 0} VNĐ
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* PAYMENT INSTRUCTIONS */}
        {paymentInstructions && (
          <Box
            sx={{
              bgcolor: (theme) => alpha(theme.palette.success.light, 0.08),
              border: '1px solid',
              borderColor: 'success.main',
              p: 3,
              borderRadius: 3,
              textAlign: 'left',
              mb: 4,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark', mb: 2 }}>
              Hướng dẫn chuyển khoản
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ color: 'text.secondary' }}>Ngân hàng:</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                  {paymentInstructions.bankName}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ color: 'text.secondary' }}>Số tài khoản:</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                  {paymentInstructions.accountNumber}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ color: 'text.secondary' }}>Chủ tài khoản:</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                  {paymentInstructions.accountHolder}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ color: 'text.secondary' }}>Nội dung chuyển khoản:</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ fontWeight: 'bold', textAlign: 'right', color: 'error.main' }}>
                  {transferContent}
                </Typography>
              </Grid>
            </Grid>
            {paymentInstructions.qrCodeUrl && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Hoặc quét mã QR để thanh toán:
                </Typography>
                <img
                  src={paymentInstructions.qrCodeUrl}
                  alt="QR Code"
                  style={{
                    maxWidth: '200px',
                    height: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </Box>
            )}
          </Box>
        )}

        <Button
          variant="contained"
          size="large"
          fullWidth
          color="warning"
          startIcon={paying ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
          onClick={() => handleMockPayment(() => navigate('/status'))}
          disabled={paying}
          sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2, mb: 2 }}
        >
          {paying ? 'Đang xử lý giao dịch...' : 'Mô phỏng Đóng Tiền (Bỏ qua bước VNPay)'}
        </Button>

        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.85rem' }}
        >
          *Ghi chú: Nút này phục vụ môi trường kiểm thử (Test) luồng kiến trúc Event-Driven của hệ
          thống. Trong thực tế, cổng sẽ điều hướng sang cổng ký số VNPay Sandbox.
        </Typography>
      </Paper>
    </Container>
  );
}
