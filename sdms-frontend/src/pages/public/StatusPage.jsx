// 📄 File: src/pages/public/StatusPage.jsx
import { useState, useCallback, useMemo } from 'react';
import { Container, Paper, Fade, Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useApplicationStatus } from '@/hooks/useApplicationStatus';
import { paymentApi } from '@/api'; 
import { useNavigate } from 'react-router-dom'; // 🌟 BỔ SUNG: Để điều hướng trang
import CustomSkeleton from '@/components/common/CustomSkeleton';
import StatusIndicator from '@/pages/public/components/Status/StatusIndicator'; 
import AssignmentInfo from '@/pages/public/components/Status/AssignmentInfo';      
import ApplicationInfo from '@/pages/public/components/Status/ApplicationInfo';   

export default function StatusPage() {
  const navigate = useNavigate(); // 🌟 Khởi tạo navigate
  const [cccd, setCccd] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false); 

  const { application, loading, error, fetchStatus } = useApplicationStatus();

  const handleCccdChange = (e) => {
    const rawValue = e.target.value;
    const onlyNums = rawValue.replace(/[^0-9]/g, '');
    setCccd(onlyNums);
    if (hasSearched) setHasSearched(false);
  };

  const handleSearch = useCallback(() => {
    const cleanCccd = cccd.trim();
    if (!cleanCccd || (cleanCccd.length !== 9 && cleanCccd.length !== 12)) return;
    
    setHasSearched(true);
    fetchStatus(cleanCccd);
  }, [cccd, fetchStatus]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleMockPayment = async () => {
    if (!application?.applicationId) return;
    
    setPaymentLoading(true);
    try {
      await paymentApi.mockPaymentSuccess(application.applicationId);
      alert("Thanh toán giả lập thành công! Giường và hóa đơn của bạn đã được chuyển sang trạng thái CHÍNH THỨC.");
      fetchStatus(cccd.trim());
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống khi thanh toán thử nghiệm: " + (err.response?.data?.message || err.message));
    } finally {
      setPaymentLoading(false);
    }
  };

  const currentLength = cccd.length;
  const isLengthInvalid = useMemo(() => currentLength > 0 && currentLength !== 9 && currentLength !== 12, [currentLength]);
  const isBtnDisabled = useMemo(() => loading || !cccd || isLengthInvalid, [loading, cccd, isLengthInvalid]);

  const helperText = useMemo(() => {
    return isLengthInvalid 
      ? `Độ dài: ${currentLength} số (Yêu cầu đúng 9 hoặc 12 số).` 
      : 'Nhập CMND cũ (9 số) hoặc CCCD mới (12 số).';
  }, [isLengthInvalid, currentLength]);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Fade in timeout={800}>
        <Paper variant="outlined" sx={{ borderRadius: 6, overflow: 'hidden', boxShadow: 3 }}>
          {/* HEADER AREA */}
          <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Tra cứu trạng thái hồ sơ
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
              Nhập số CCCD/CMND để xem tiến độ duyệt hồ sơ của bạn
            </Typography>
          </Box>

          {/* CONTENT AREA */}
          <Box sx={{ p: { xs: 3, md: 6 } }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'flex-start' }}>
              <TextField 
                fullWidth 
                label="Số CCCD / CMND" 
                variant="outlined" 
                value={cccd}
                onChange={handleCccdChange}
                onKeyDown={handleKeyDown}
                error={isLengthInvalid}
                helperText={helperText}
                inputProps={{ 
                  maxLength: 12, 
                  inputMode: 'numeric'
                }}
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

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

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
                  
                  <ApplicationInfo application={application} />

                  {/* KHU VỰC 1: THANH TOÁN MOCK TIỀN PHÒNG */}
                  {application.status === 'WAITING_PAYMENT' && (
                    <Box 
                      sx={{ 
                        mt: 4, p: 4, 
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50', 
                        borderRadius: 4, border: '1px dashed', borderColor: 'warning.main', textAlign: 'center' 
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Hồ sơ hợp lệ & Đã được cấp phòng thành công!
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                        Số tiền lưu trú cần đóng cho học kỳ này: 
                        <span style={{ color: '#d32f2f', fontSize: '1.4rem', fontWeight: 'bold', marginLeft: '6px' }}>
                          {application.bill ? application.bill.amount.toLocaleString('vi-VN') : '2,100,000'}
                        </span> đ
                      </Typography>
                      <Button 
                        variant="contained" color="success" size="large"
                        disabled={paymentLoading} onClick={handleMockPayment}
                        sx={{ fontWeight: 'bold', px: 5, py: 1.8, borderRadius: 2 }}
                      >
                        {paymentLoading ? 'Đang xử lý thanh toán...' : 'Xác nhận thanh toán thử nghiệm (2.100.000đ)'}
                      </Button>
                    </Box>
                  )}

                  {/* 🌟 CẬP NHẬT MỚI: HỒ SƠ ĐÃ APPROVED -> HIỂN THỊ NÚT KÍCH HOẠT ĐIỀU HƯỚNG SẠCH */}
                  {application.status === 'APPROVED' && (
                    <Box 
                      sx={{ 
                        mt: 4, p: 4, 
                        bgcolor: 'success.light', color: 'success.contrastText',
                        borderRadius: 4, textAlign: 'center', boxShadow: 2
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Hồ sơ đã được duyệt chính thức thành công!
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                        Hệ thống đã khởi tạo tài khoản ký túc xá cho bạn. Vui lòng nhấn nút dưới đây để kích hoạt và thiết lập mật khẩu đăng nhập lần đầu.
                      </Typography>
                      <Button 
                        variant="contained" color="primary" size="large"
                        onClick={() => navigate('/activate-account')} // 🌟 FIX ROUTE CHUẨN ĐỒNG BỘ FRONTEND
                        sx={{ fontWeight: 'bold', px: 4, py: 1.5, borderRadius: 2, bgcolor: 'primary.dark' }}
                      >
                        Đi Đến Kích Hoạt Tài Khoản Cư Dân
                      </Button>
                    </Box>
                  )}
                </Box>
              </Fade>
            ) : (
              hasSearched && !error && (
                <Fade in>
                  <Alert severity="info" sx={{ borderRadius: 2, mt: 2 }}>
                    Không tìm thấy dữ liệu hồ sơ nội trú nào gắn liền với số định danh này trên hệ thống đợt hiện tại. Vui lòng kiểm tra lại số Căn cước.
                  </Alert>
                </Fade>
              )
            )}
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
}