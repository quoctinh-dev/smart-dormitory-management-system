import PaymentIcon from '@mui/icons-material/Payment';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { usePayment } from '@/hooks/usePayment';

export default function PaymentPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [paymentQrUrl, setPaymentQrUrl] = useState<string | null>(null);

  const { bill, application, paymentInstructions, loading, paying, handleOnlinePayment } =
    usePayment(applicationId || '');

  // Bóc tách thông tin từ URL QR để hiển thị cho người dùng tự gõ
  const qrDetails = useMemo(() => {
    if (!paymentQrUrl) return null;
    try {
      const url = new URL(paymentQrUrl);
      return {
        bank: url.searchParams.get('bank') || 'Ngân hàng',
        acc: url.searchParams.get('acc') || '',
        amount: url.searchParams.get('amount') || '',
        des: url.searchParams.get('des') || '',
      };
    } catch (e) {
      return null;
    }
  }, [paymentQrUrl]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) return <CustomSkeleton type="dashboard" count={1} />;

  // Construct transfer content
  const transferContent =
    typeof (paymentInstructions as any)?.contentPrefix === 'string' &&
    typeof application?.cccd === 'string'
      ? `${(paymentInstructions as any).contentPrefix}${application.cccd}`
      : (application?.cccd ?? '');

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
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark', mb: 2, textTransform: 'uppercase' }}>
              ĐÓNG TIỀN PHÒNG KTX BẰNG CHUYỂN KHOẢN
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 1 }}>
              - <strong>Ngân hàng:</strong> {paymentInstructions.bankName}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              - <strong>Số tài khoản:</strong> <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>{paymentInstructions.accountNumber}</span>
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              - <strong>Tên tài khoản:</strong> TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              - <strong>Số tiền:</strong> Sinh viên chuyển khoản đúng số tiền theo thông tin Hóa đơn tiền phòng.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              - <strong>Nội dung:</strong> Họ tên sinh viên, MSSV, học kỳ, năm học (VD: NGUYEN VAN A, {application?.studentCode || 'MSSV...'}, HỌC KỲ 3 2025-2026)
            </Typography>

            <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: '#fff3cd', borderRadius: 2, border: '1px solid #ffe69c' }}>
              <Typography variant="body2" sx={{ color: '#856404' }}>
                <strong>* LƯU Ý QUAN TRỌNG ĐỂ HỆ THỐNG DUYỆT TỰ ĐỘNG (SEPAY):</strong><br/>
                Để hệ thống tự động nhận diện và gạch nợ thành công, trong phần <strong>Nội dung chuyển khoản</strong>, bạn <strong>BẮT BUỘC</strong> phải ghi kèm mã: <strong style={{ color: '#d32f2f', fontSize: '1.1em' }}>{transferContent}</strong>
                <br/><br/>
                <em>Ví dụ: NGUYEN VAN A, {application?.studentCode}, HK3 2025, {transferContent}</em>
              </Typography>
            </Box>

            {paymentInstructions.qrCodeUrl && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Hoặc quét mã QR dưới đây để tự động điền thông tin:
                </Typography>
                <img
                  src={paymentInstructions.qrCodeUrl}
                  alt="QR Code"
                  style={{
                    maxWidth: '250px',
                    height: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '10px',
                    backgroundColor: '#fff'
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
          color="primary"
          startIcon={paying ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
          onClick={async () => {
            const url = await handleOnlinePayment('BANK_TRANSFER');
            if (url) {
              setPaymentQrUrl(url);
            }
          }}
          disabled={paying}
          sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2, mb: 2 }}
        >
          {paying ? 'Đang tạo mã QR...' : 'Tạo Mã QR Thanh Toán (Tự Động)'}
        </Button>
      </Paper>

      {/* DIALOG SHOW QR CODE CAO CẤP */}
      <Dialog 
        open={!!paymentQrUrl} 
        onClose={() => setPaymentQrUrl(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: 'hidden' }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          p: 2
        }}>
          <Typography variant="h6" fontWeight="bold">Thông Tin Thanh Toán</Typography>
          <IconButton onClick={() => setPaymentQrUrl(null)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 0, bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            {/* CỘT TRÁI: QR CODE */}
            <Box sx={{ 
              flex: 1, 
              p: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              borderRight: { md: '1px solid #e0e0e0' },
              bgcolor: 'white'
            }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
                Cách 1: Quét mã QR (Khuyên dùng)
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                Mở ứng dụng ngân hàng và quét mã để tự động điền mọi thông tin.
              </Typography>
              
              <Box sx={{ 
                p: 2, 
                border: '2px dashed #ccc', 
                borderRadius: 4, 
                bgcolor: '#fff',
                width: 250,
                height: 250,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {paymentQrUrl && (
                  <img 
                    src={paymentQrUrl} 
                    alt="Mã QR Thanh Toán" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                )}
              </Box>
            </Box>

            {/* CỘT PHẢI: MANUAL INFO */}
            <Box sx={{ flex: 1, p: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
                Cách 2: Chuyển khoản thủ công
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Nếu bạn không thể quét QR (VD: Đang dùng điện thoại), hãy copy chính xác các thông tin sau:
              </Typography>

              {qrDetails && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ngân hàng thụ hưởng</Typography>
                    <Typography variant="body1" fontWeight="bold">{qrDetails.bank}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">Tên tài khoản</Typography>
                    <Typography variant="body1" fontWeight="bold">TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Số tài khoản</Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary.dark">{qrDetails.acc}</Typography>
                    </Box>
                    <Tooltip title="Copy số tài khoản">
                      <IconButton size="small" onClick={() => handleCopy(qrDetails.acc)} sx={{ bgcolor: 'action.hover' }}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Số tiền</Typography>
                      <Typography variant="h6" fontWeight="bold" color="error.main">
                        {parseInt(qrDetails.amount).toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Box>
                    <Tooltip title="Copy số tiền">
                      <IconButton size="small" onClick={() => handleCopy(qrDetails.amount)} sx={{ bgcolor: 'action.hover' }}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#fff3cd', borderRadius: 2, border: '1px solid #ffe69c' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#856404', fontWeight: 'bold' }}>Nội dung chuyển khoản (BẮT BUỘC CHÍNH XÁC)</Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#d32f2f' }}>{qrDetails.des}</Typography>
                    </Box>
                    <Tooltip title="Copy nội dung">
                      <IconButton size="small" onClick={() => handleCopy(qrDetails.des)} sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setPaymentQrUrl(null)} variant="outlined" size="large">Đóng Lại</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
