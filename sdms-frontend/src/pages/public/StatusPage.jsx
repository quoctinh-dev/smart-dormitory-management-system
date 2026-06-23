import { useState, useCallback, useMemo } from 'react';
import { Container, Paper, Fade, Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useApplicationStatus } from '@/hooks/useApplicationStatus';
import CustomSkeleton from '@/components/common/CustomSkeleton';
import StatusIndicator from './components/Status/StatusIndicator';
import AssignmentInfo from './components/Status/AssignmentInfo';
import ApplicationInfo from './components/Status/ApplicationInfo';

export default function StatusPage() {
  const [cccd, setCccd] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // Trạng thái kiểm soát để hiện thông báo "Không tìm thấy hồ sơ"

  const { application, assignment, documents, loading, error, fetchStatus } = useApplicationStatus();

  // Xử lý lọc dữ liệu đầu vào chỉ cho phép nhập số
  const handleCccdChange = (e) => {
    const rawValue = e.target.value;
    const onlyNums = rawValue.replace(/[^0-9]/g, '');
    setCccd(onlyNums);
    if (hasSearched) setHasSearched(false); // Reset trạng thái khi bắt đầu gõ số mới
  };

  // TỐI ƯU HIỆU NĂNG: Bọc hành động tra cứu bằng useCallback
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

  // Các biến tính toán trạng thái Helper Text và Nút Bấm bằng useMemo để tối ưu CPU
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
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText', 
              py: 4, 
              textAlign: 'center' 
            }}
          >
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
                slotProps={{
                  htmlInput: {
                    maxLength: 12, 
                    inputMode: 'numeric'
                  }
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
                  <StatusIndicator 
                    status={application.status} 
                    applicationId={application.applicationId} 
                  />
                  <AssignmentInfo assignment={assignment} />
                  <ApplicationInfo 
                    application={application} 
                    documents={documents} 
                    fetchStatus={fetchStatus} 
                  />
                </Box>
              </Fade>
            ) : (
              // CHUẨN UX: Nếu đã bấm nút Tìm kiếm nhưng API trả về null (Không có đơn nháp/đơn chính thức)
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