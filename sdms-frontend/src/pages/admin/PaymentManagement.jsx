import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, Snackbar, Alert, Tabs, Tab, TextField, 
  InputAdornment, MenuItem 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { alpha } from '@mui/material/styles';

// ĐÚNG CHUẨN: Sử dụng Absolute Import đồng bộ toàn bộ dự án
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import CustomSkeleton from '@/components/common/CustomSkeleton';

// Map từ khóa Enum Backend sang định dạng tiếng Việt hiển thị UI chuẩn chỉ
const BILL_TYPES = {
  ALL: 'Tất cả loại phí',
  ACCOMMODATION: 'Phí nội trú / Phòng',
  SERVICE: 'Phí dịch vụ (Điện/Nước)',
  FINE: 'Phí phạt vi phạm',
  OTHER: 'Phí khác'
};

const STATUS_MAP = {
  UNPAID: { label: 'Chưa đóng', color: 'warning' },
  PARTIALLY_PAID: { label: 'Đóng một phần', color: 'info' },
  PAID: { label: 'Đã đóng', color: 'success' },
  OVERDUE: { label: 'Quá hạn (Chưa đóng)', color: 'error' },
  CANCELLED: { label: 'Đã hủy', color: 'default' }
};

export default function PaymentManagement() {
  const {
    bills, loading, confirmDialog, detailsDialog, selectedBill, snackbar,
    currentTab, searchQuery, billTypeFilter, setCurrentTab, setSearchQuery, setBillTypeFilter,
    setConfirmDialog, setDetailsDialog, handleConfirmCashPayment, openDetails, openConfirm, closeSnackbar
  } = usePaymentManagement();

  // ĐÚNG CHUẨN UI: Hiển thị Skeleton loading khi dữ liệu đang tải lên ban đầu, không để trắng màn hình
  if (loading && bills.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <CustomSkeleton type="table" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
        Quản lý Thanh toán & Hóa đơn
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4 }}>
        Theo dõi trạng thái thu tiền đóng phí, quản lý dòng tiền và phê duyệt thanh toán tiền mặt trực tiếp tại quầy hành chính.
      </Typography>

      {/* TOOLBAR: THANH ĐIỀU HƯỚNG BỘ LỌC TẬP TRUNG */}
      <Paper variant="outlined" sx={{ borderRadius: 3, mb: 3, p: 2, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Nhóm Tabs trạng thái đóng tiền */}
          <Tabs 
            value={currentTab} 
            onChange={(_, newValue) => setCurrentTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Tất cả" value="ALL" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label="Chưa thanh toán" value="UNPAID" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label="Đã thanh toán" value="PAID" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label="Đã hủy" value="CANCELLED" sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>

          {/* Nhóm các Ô kiểm soát tìm kiếm nâng cao */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
            
            {/* ĐÚNG CHUẨN: Lọc phân tách các loại phí cấu hình từ Backend */}
            <TextField
              select
              size="small"
              label="Bộ lọc loại phí"
              value={billTypeFilter}
              onChange={(e) => setBillTypeFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {Object.entries(BILL_TYPES).map(([key, val]) => (
                <MenuItem key={key} value={key}>{val}</MenuItem>
              ))}
            </TextField>

            {/* Ô nhập thông tin tìm kiếm nhanh */}
            <TextField
              size="small"
              placeholder="Tìm tên sinh viên, mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ width: { xs: '100%', sm: 240 } }}
            />
          </Box>
        </Box>
      </Paper>

      {/* DANH SÁCH BẢNG HIỂN THỊ DỮ LIỆU CHUẨN HOÁ */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, borderColor: 'divider', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04) }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Mã Hóa Đơn</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Sinh viên</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phân loại phí</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Số tiền (VNĐ)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary', fontStyle: 'italic' }}>
                  Không tìm thấy dữ liệu hóa đơn nào phù hợp với bộ lọc hiện hành.
                </TableCell>
              </TableRow>
            ) : (
              bills.map(bill => {
                const statusStyle = STATUS_MAP[bill.status] || { label: bill.status, color: 'default' };
                return (
                  <TableRow key={bill.billId} hover>
                    <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', color: 'primary.main' }}>
                      {bill.billCode}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{bill.studentName}</TableCell>
                    <TableCell>
                      <Chip 
                        label={BILL_TYPES[bill.billType] || bill.billType || 'Phí hệ thống'} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ fontWeight: 600 }} 
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      {bill.amount?.toLocaleString('vi-VN') || 0}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={statusStyle.label} 
                        color={statusStyle.color}
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        <IconButton color="info" size="small" onClick={() => openDetails(bill)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        
                        {/* Chỉ hiện nút gạch nợ tiền mặt nếu hóa đơn ở trạng thái chưa đóng hoặc quá hạn */}
                        {(bill.status === 'UNPAID' || bill.status === 'OVERDUE') && (
                          <Button 
                            variant="contained" 
                            size="small" 
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => openConfirm(bill)}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
                          >
                            Thu tiền mặt
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DIALOG XÁC NHẬN THU TIỀN MẶT TẠI QUẦY */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận thu tiền mặt</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          Hệ thống ghi nhận bạn đã nhận trực tiếp và đủ số tiền nộp 
          <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold', mx: 0.5 }}>
            {selectedBill?.amount?.toLocaleString('vi-VN')} VNĐ
          </Box> 
          từ sinh viên <b>{selectedBill?.studentName}</b> cho hóa đơn <b>{selectedBill?.billCode}</b>? Hành động này không thể hoàn tác.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDialog(false)}>Hủy</Button>
          <Button variant="contained" color="success" onClick={handleConfirmCashPayment}>
            Xác nhận Thu Tiền
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG XEM CHI TIẾT TOÀN BỘ THÔNG TIN HOÁ ĐƠN */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Chi tiết thông tin hóa đơn hệ thống</DialogTitle>
        <DialogContent dividers>
          {selectedBill && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Mã định danh hóa đơn (UUID):</Typography>
                <Typography sx={{ fontWeight: 'bold', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  {selectedBill.billId}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Mã rút gọn:</Typography>
                <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {selectedBill.billCode}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Họ và tên sinh viên:</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{selectedBill.studentName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Danh mục loại phí:</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {BILL_TYPES[selectedBill.billType] || selectedBill.billType}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Thời hạn đóng cuối cùng:</Typography>
                <Typography sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  {selectedBill.dueDate ? new Date(selectedBill.dueDate).toLocaleString('vi-VN') : 'Không giới hạn'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Tổng nghĩa vụ tài chính:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {selectedBill.amount?.toLocaleString('vi-VN')} VNĐ
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailsDialog(false)} variant="contained" color="primary">
            Đóng cửa sổ
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR THÔNG BÁO TIẾN TRÌNH TẬP TRUNG */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={closeSnackbar} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}