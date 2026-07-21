import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  TablePagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useState } from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import studentApi from '@/api/student-api';
import { StudentProfileResponse } from '@/types/student';

const BILL_TYPES: Record<string, string> = {
  ALL: 'Tất cả loại phí',
  ACCOMMODATION_FEE: 'Phí phòng / Nội trú',
  ELECTRIC_FEE: 'Tiền điện',
  WATER_FEE: 'Tiền nước',
  PENALTY_FEE: 'Phạt / Đền bù',
};

const STATUS_MAP: Record<
    string,
    { label: string; color: 'warning' | 'info' | 'success' | 'error' | 'default' }
> = {
  UNPAID: { label: 'Chưa đóng', color: 'warning' },
  PARTIALLY_PAID: { label: 'Đóng một phần', color: 'info' },
  PAID: { label: 'Đã đóng', color: 'success' },
  OVERDUE: { label: 'Quá hạn', color: 'error' },
  CANCELLED: { label: 'Đã hủy', color: 'default' },
};

export default function PaymentManagement() {
  const {
    bills,
    loading,
    confirmDialog,
    detailsDialog,
    selectedBill,
    currentTab,
    searchQuery,
    billTypeFilter,
    setCurrentTab,
    setSearchQuery,
    setBillTypeFilter,
    setConfirmDialog,
    setDetailsDialog,
    handleConfirmCashPayment,
    handleCreateManualBill,
    openDetails,
    openConfirm,
  } = usePaymentManagement();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [manualBillDialog, setManualBillDialog] = useState(false);
  const [manualBillData, setManualBillData] = useState({
    studentId: '',
    roomId: '',
    amount: '',
    description: '',
    billType: 'PENALTY_FEE',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  // Autocomplete state cho Sinh viên
  const [studentOptions, setStudentOptions] = useState<StudentProfileResponse[]>([]);
  const [studentSearchLoading, setStudentSearchLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileResponse | null>(null);

  // Debounce search sinh viên
  React.useEffect(() => {
    let active = true;
    const fetchStudents = async () => {
      setStudentSearchLoading(true);
      try {
        const res = await studentApi.getAllStudents({ page: 0, size: 20 });
        if (active) {
          setStudentOptions(res.content || []);
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách sinh viên', err);
      } finally {
        if (active) setStudentSearchLoading(false);
      }
    };
    if (manualBillDialog) {
      fetchStudents();
    }
    return () => {
      active = false;
    };
  }, [manualBillDialog]);

  const displayedBills = bills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading && bills.length === 0) {
    return (
        <Box sx={{ p: 3 }}>
          <CustomSkeleton type="table" count={5} />
        </Box>
    );
  }

  return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header trang */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Quản lý thanh toán và hóa đơn
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Theo dõi trạng thái thu phí, quản lý danh sách hóa đơn và xác nhận thu tiền mặt trực tiếp.
            </Typography>
          </Box>
          <Button
              variant="contained"
              color="error"
              disableElevation
              onClick={() => setManualBillDialog(true)}
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 2.5 }}
          >
            + Hóa đơn đền bù / phạt
          </Button>
        </Box>

        {/* Điều hướng và bộ lọc */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                  value={currentTab}
                  onChange={(_, newValue) => {
                    setCurrentTab(newValue);
                    setPage(0);
                  }}
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{
                    minHeight: 40,
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 40, fontSize: '0.95rem' },
                    '& .Mui-selected': { fontWeight: 600 },
                  }}
              >
                <Tab label="Tất cả" value="ALL" />
                <Tab label="Chưa thanh toán" value="UNPAID" />
                <Tab label="Đã thanh toán" value="PAID" />
                <Tab label="Đã hủy" value="CANCELLED" />
              </Tabs>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                  size="small"
                  placeholder="Tìm theo tên sinh viên, mã hóa đơn..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                    ),
                  }}
              />

              <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
                <InputLabel>Loại phí</InputLabel>
                <Select
                    value={billTypeFilter}
                    label="Loại phí"
                    onChange={(e) => {
                      setBillTypeFilter(e.target.value);
                      setPage(0);
                    }}
                    sx={{ borderRadius: 1.5 }}
                >
                  {Object.entries(BILL_TYPES).map(([key, val]) => (
                      <MenuItem key={key} value={key}>
                        {val}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Paper>

        {/* Bảng dữ liệu hóa đơn */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Mã hóa đơn</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Sinh viên</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Loại phí</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Số tiền (VNĐ)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Hạn thanh toán</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary" variant="body2" sx={{ fontStyle: 'italic' }}>
                          Không tìm thấy dữ liệu hóa đơn phù hợp.
                        </Typography>
                      </TableCell>
                    </TableRow>
                ) : (
                    displayedBills.map((bill) => {
                      const statusStyle = STATUS_MAP[bill.status] || {
                        label: bill.status,
                        color: 'default',
                      };
                      return (
                          <TableRow key={bill.billId} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                                {bill.billCode}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {bill.studentName}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Chip
                                  label={BILL_TYPES[bill.billType] || bill.billType || 'Phí hệ thống'}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontWeight: 600, borderRadius: 1 }}
                              />
                            </TableCell>

                            <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                              {bill.amount?.toLocaleString('vi-VN') || 0}
                            </TableCell>

                            <TableCell>
                              <Typography
                                  variant="body2"
                                  color={bill.status === 'OVERDUE' ? 'error.main' : 'text.secondary'}
                                  sx={{ fontWeight: bill.status === 'OVERDUE' ? 600 : 400 }}
                              >
                                {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('vi-VN') : '—'}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Chip
                                  label={statusStyle.label}
                                  color={statusStyle.color}
                                  size="small"
                                  sx={{ fontWeight: 600, borderRadius: 1 }}
                              />
                            </TableCell>

                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <IconButton
                                    color="primary"
                                    size="small"
                                    title="Xem chi tiết"
                                    onClick={() => openDetails(bill)}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>

                                {(bill.status === 'UNPAID' || bill.status === 'OVERDUE') && (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="success"
                                        disableElevation
                                        startIcon={<CheckCircleIcon fontSize="small" />}
                                        onClick={() => openConfirm(bill)}
                                        sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                                    >
                                      Thu tiền mặt
                                    </Button>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={bills.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Số dòng mỗi trang:"
              sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        </Paper>

        {/* Dialog xác nhận thu tiền mặt */}
        <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Xác nhận thu tiền mặt</DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            <Typography variant="body2">
              Xác nhận đã nhận đủ số tiền{' '}
              <strong style={{ color: '#2e7d32' }}>
                {selectedBill?.amount?.toLocaleString('vi-VN')} VNĐ
              </strong>{' '}
              từ sinh viên <strong>{selectedBill?.studentName}</strong> cho hóa đơn{' '}
              <strong>{selectedBill?.billCode}</strong>.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setConfirmDialog(false)} color="inherit" sx={{ borderRadius: 1.5, textTransform: 'none', color: 'text.secondary' }}>
              Hủy bỏ
            </Button>
            <Button
                variant="contained"
                color="success"
                disableElevation
                onClick={handleConfirmCashPayment}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Xác nhận
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog chi tiết hóa đơn */}
        <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Thông tin chi tiết hóa đơn</DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            {selectedBill && (
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Mã hóa đơn:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', color: 'primary.main' }}>
                      {selectedBill.billCode}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Sinh viên:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedBill.studentName}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Loại phí:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {BILL_TYPES[selectedBill.billType] || selectedBill.billType}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Hạn thanh toán:</Typography>
                    <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                      {selectedBill.dueDate
                          ? new Date(selectedBill.dueDate).toLocaleDateString('vi-VN')
                          : 'Không thời hạn'}
                    </Typography>
                  </Box>

                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Tổng tiền:</Typography>
                    <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {selectedBill.amount?.toLocaleString('vi-VN')} VNĐ
                    </Typography>
                  </Box>
                </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setDetailsDialog(false)} variant="outlined" color="inherit" sx={{ borderRadius: 1.5, textTransform: 'none', color: 'text.secondary' }}>
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal Tạo Hóa Đơn Thủ Công */}
        <Dialog
            open={manualBillDialog}
            onClose={() => setManualBillDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            Tạo hóa đơn đền bù / vi phạm
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5, overflow: 'visible' }}>
            <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
              <Autocomplete
                  options={studentOptions}
                  getOptionLabel={(option) => `${option.fullName} - ${option.studentCode || option.cccd}`}
                  value={selectedStudent}
                  onChange={(_, newValue) => {
                    setSelectedStudent(newValue);
                    setManualBillData({ ...manualBillData, studentId: newValue ? newValue.studentId : '' });
                  }}
                  loading={studentSearchLoading}
                  renderInput={(params) => (
                      <TextField
                          {...params}
                          label="Chọn Sinh viên (Bắt buộc)"
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                  {studentSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                          }}
                      />
                  )}
              />
              <TextField
                  label="Room ID (Tùy chọn)"
                  fullWidth
                  size="small"
                  value={manualBillData.roomId}
                  onChange={(e) => setManualBillData({ ...manualBillData, roomId: e.target.value })}
                  placeholder="Nhập UUID của phòng nếu có"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Loại hóa đơn</InputLabel>
                <Select
                    value={manualBillData.billType}
                    label="Loại hóa đơn"
                    onChange={(e) => setManualBillData({ ...manualBillData, billType: e.target.value })}
                    sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="PENALTY_FEE">Đền bù tài sản / Phạt vi phạm</MenuItem>
                  <MenuItem value="ACCOMMODATION_FEE">Thu bù tiền phòng</MenuItem>
                  <MenuItem value="ELECTRIC_FEE">Thu bù tiền điện</MenuItem>
                  <MenuItem value="WATER_FEE">Thu bù tiền nước</MenuItem>
                </Select>
              </FormControl>
              <TextField
                  label="Số tiền (VND)"
                  type="number"
                  fullWidth
                  size="small"
                  value={manualBillData.amount}
                  onChange={(e) => setManualBillData({ ...manualBillData, amount: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
              <TextField
                  label="Lý do phạt / đền bù"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  value={manualBillData.description}
                  onChange={(e) => setManualBillData({ ...manualBillData, description: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
              <TextField
                  label="Hạn thanh toán"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={manualBillData.dueDate}
                  onChange={(e) => setManualBillData({ ...manualBillData, dueDate: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setManualBillDialog(false)} color="inherit" sx={{ textTransform: 'none', borderRadius: 1.5, color: 'text.secondary' }}>
              Hủy bỏ
            </Button>
            <Button
                variant="contained"
                disableElevation
                color="error"
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 3 }}
                onClick={async () => {
                  if (!manualBillData.studentId || !manualBillData.amount || !manualBillData.description) {
                    alert('Vui lòng nhập đầy đủ Student ID, Số tiền và Lý do!');
                    return;
                  }
                  const success = await handleCreateManualBill({
                    studentId: manualBillData.studentId,
                    roomId: manualBillData.roomId || undefined,
                    amount: Number(manualBillData.amount),
                    description: manualBillData.description,
                    billType: manualBillData.billType,
                    dueDate: manualBillData.dueDate,
                  });
                  if (success) {
                    setManualBillDialog(false);
                    setSelectedStudent(null);
                    setManualBillData({
                      studentId: '',
                      roomId: '',
                      amount: '',
                      description: '',
                      billType: 'PENALTY_FEE',
                      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                    });
                  }
                }}
            >
              Tạo hóa đơn
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}