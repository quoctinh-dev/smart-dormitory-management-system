// 📄 File: src/pages/public/StatusPage.jsx
import { Container, Paper, Fade, Box, Typography, TextField, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // 🌟 BỔ SUNG: Để điều hướng trang

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useApplicationStatus } from '@/hooks/useApplicationStatus';
import ApplicationInfo from '@/pages/public/components/Status/ApplicationInfo';
import AssignmentInfo from '@/pages/public/components/Status/AssignmentInfo';
import StatusIndicator from '@/pages/public/components/Status/StatusIndicator';

export default function StatusPage() {
  const navigate = useNavigate(); // 🌟 Khởi tạo navigate
  const [studentCode, setStudentCode] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [paymentQrUrl, setPaymentQrUrl] = useState(null);

  const { application, loading, paymentLoading, fetchStatus, handleOnlinePayment } =
    useApplicationStatus();

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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleStudentCodeChange = (e) => {
    const rawValue = e.target.value;
    setStudentCode(rawValue);
    if (hasSearched) setHasSearched(false);
  };

  const handleSearch = useCallback(() => {
    const cleanStudentCode = studentCode.trim();
    if (!cleanStudentCode) return;

    setHasSearched(true);
    fetchStatus(cleanStudentCode);
  }, [studentCode, fetchStatus]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isBtnDisabled = useMemo(
    () => loading || !studentCode,
    [loading, studentCode]
  );

  const helperText = 'Nhập Mã số sinh viên của bạn để tra cứu';

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Fade in timeout={800}>
        <Paper variant="outlined" sx={{ borderRadius: 6, overflow: 'hidden', boxShadow: 3 }}>
          {/* HEADER AREA */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              py: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Tra cứu trạng thái hồ sơ
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
              Nhập Mã số sinh viên để xem tiến độ duyệt hồ sơ của bạn
            </Typography>
          </Box>

          {/* CONTENT AREA */}
          <Box sx={{ p: { xs: 3, md: 6 } }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                label="Mã số sinh viên"
                variant="outlined"
                value={studentCode}
                onChange={handleStudentCodeChange}
                onKeyDown={handleKeyDown}
                helperText={helperText}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleSearch}
                disabled={isBtnDisabled}
                sx={{ minWidth: 120, height: 56, borderRadius: 2, fontWeight: 'bold' }}
              >
                {loading ? 'Đang tìm...' : 'Tra cứu'}
              </Button>
            </Box>

            {/* DYNAMIC RESULTS RENDER */}
            {loading ? (
              <CustomSkeleton type="list" count={3} />
            ) : application ? (
              <Fade in timeout={400}>
                <Box>
                  <StatusIndicator status={application.status} />

                  {application.assignment && (
                    <AssignmentInfo
                      assignment={application.assignment}
                      applicationStatus={application.status}
                    />
                  )}

                  {/* THÔNG BÁO CHO DANH SÁCH CHỜ */}
                  {application.status === 'WAITING_LIST' && (
                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                      <strong>Thông báo:</strong> Hiện tại ký túc xá đang tạm thời hết phòng trống
                      theo cấu hình phân bổ. Hồ sơ của bạn đã được hệ thống tự động đưa vào{' '}
                      <strong>Danh sách chờ</strong>. Ngay khi có sinh viên khác hủy đơn hoặc trả
                      phòng, hệ thống sẽ tự động xếp phòng cho bạn theo thứ tự ưu tiên và cập nhật
                      trạng thái tại đây.
                    </Alert>
                  )}

                  {/* THÔNG BÁO KHI BỊ TỪ CHỐI */}
                  {application.status === 'REJECTED' && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      <strong>Hồ sơ của bạn đã bị từ chối với lý do: </strong>
                      {application.reviewNote || 'Không có lý do cụ thể.'}
                    </Alert>
                  )}

                  <ApplicationInfo
                    application={application}
                    documents={application.documents}
                    fetchStatus={fetchStatus}
                  />

                  {/* KHU VỰC 1: THANH TOÁN ONLINE */}
                  {application.status === 'WAITING_PAYMENT' && application.bill && (
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={paymentLoading}
                        onClick={async () => {
                          const url = await handleOnlinePayment('BANK_TRANSFER');
                          if (url) {
                            setPaymentQrUrl(url);
                          }
                        }}
                        sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
                      >
                        {paymentLoading 
                          ? 'ĐANG TẠO MÃ QR...' 
                          : `TẠO MÃ QR THANH TOÁN - ${application.bill.amount.toLocaleString('vi-VN')}đ`}
                      </Button>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Nhấn nút trên để lấy thông tin mã QR chuyển khoản tiền phòng tự động.
                      </Typography>
                    </Box>
                  )}

                  {/* 🌟 CẬP NHẬT MỚI: HỒ SƠ ĐÃ APPROVED -> HIỂN THỊ NÚT KÍCH HOẠT VÀ NHẮC NHỞ CHECK-IN */}
                  {application.status === 'APPROVED' && (
                    <Box
                      sx={{
                        mt: 4,
                        p: 4,
                        bgcolor: 'success.light',
                        color: 'success.contrastText',
                        borderRadius: 4,
                        textAlign: 'center',
                        boxShadow: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Thanh toán thành công & Hồ sơ đã được duyệt!
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
                        Vui lòng mang giấy tờ tùy thân đến quầy lễ tân ký túc xá để tiến hành thủ
                        tục nhận phòng (Check-in).
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                        Đồng thời, hệ thống đã khởi tạo tài khoản cư dân nội trú cho bạn. Hãy kích
                        hoạt ngay để sử dụng dịch vụ.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => navigate('/activate-account')}
                        sx={{
                          fontWeight: 'bold',
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          bgcolor: 'primary.dark',
                        }}
                      >
                        Kích Hoạt Tài Khoản Cư Dân
                      </Button>
                    </Box>
                  )}
                </Box>
              </Fade>
            ) : (
              hasSearched && (
                <Fade in>
                  <Alert severity="info" sx={{ borderRadius: 2, mt: 2 }}>
                    Không tìm thấy dữ liệu hồ sơ nội trú nào gắn liền với số định danh này trên hệ
                    thống đợt hiện tại. Vui lòng kiểm tra lại số Căn cước.
                  </Alert>
                </Fade>
              )
            )}
          </Box>
        </Paper>
      </Fade>

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
