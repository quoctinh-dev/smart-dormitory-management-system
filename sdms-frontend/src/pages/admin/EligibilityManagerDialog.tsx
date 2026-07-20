import { Delete, CloudUpload, Search } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  TablePagination,
  alpha,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useRef, useState } from 'react';

import { useEligibilityManager } from '@/hooks/useEligibilityManager';
import { RegistrationPeriodResponse } from '@/types/registration';

interface EligibilityManagerDialogProps {
  open: boolean;
  onClose: () => void;
  period: RegistrationPeriodResponse | null;
}

export default function EligibilityManagerDialog({
  open,
  onClose,
  period,
}: EligibilityManagerDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CHUẨN HÓA UI: Nhận thêm các biến và hàm điều khiển phân trang từ Hook mới
  const {
    eligibilities,
    loading,
    importing,
    deleteTarget,
    page,
    size,
    totalElements,
    setPage,
    setSize,
    setDeleteTarget,
    keyword,
    setKeyword,
    confirmDelete,
    confirmDeleteAll,
    handleImportExcel,
  } = useEligibilityManager(period, open);

  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleImportExcel(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0); // Reset về trang đầu tiên khi thay đổi kích thước trang
  };

  const openDeleteConfirm = (eligibilityId: string) => () => {
    setDeleteTarget(eligibilityId);
  };

  if (!period) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {period.registrationType === 'OPEN_REGISTRATION'
            ? 'Danh sách ưu tiên'
            : 'Danh sách đủ điều kiện'}{' '}
          - {period.periodName}
        </DialogTitle>
        <DialogContent dividers sx={{ pb: 0 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
              {period.registrationType === 'OPEN_REGISTRATION'
                ? 'Tải lên file Excel (.xlsx) gồm các cột CCCD, Họ Tên, MSSV, Email để cấu hình danh sách sinh viên ưu tiên (VD: Năm nhất). Hệ thống vẫn cho phép tất cả sinh viên khác đăng ký bình thường.'
                : 'Tải lên file Excel (.xlsx) gồm các cột CCCD, Họ Tên, MSSV, Email để cấu hình bộ lọc sinh viên hợp lệ.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Tìm kiếm sinh viên..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(0);
                }}
                sx={{ width: 220, bgcolor: '#ffffff', borderRadius: 1 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setConfirmDeleteAllOpen(true)}
                disabled={totalElements === 0}
                sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
              >
                Xóa tất cả
              </Button>
            </Box>

            <Box>
              <input
                type="file"
                accept=".xlsx"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button
                variant="outlined"
                startIcon={
                  importing ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />
                }
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
              >
                {importing ? 'Đang tải lên...' : 'Tải lên danh sách'}
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ overflow: 'hidden', maxHeight: '400px' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>CCCD</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Mã sinh viên</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Họ và tên</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        Hành động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eligibilities.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          align="center"
                          sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}
                        >
                          Chưa có dữ liệu bộ lọc hoặc trang này không có dữ liệu. Vui lòng kiểm tra
                          lại.
                        </TableCell>
                      </TableRow>
                    ) : (
                      eligibilities.map((row, index) => (
                        <TableRow key={row.eligibilityId} hover>
                          {/* CHUẨN HÓA LOGIC: Tính số thứ tự tăng tiến chuẩn theo trang */}
                          <TableCell>{index + 1 + page * size}</TableCell>
                          <TableCell>{row.cccd || 'N/A'}</TableCell>
                          <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            {row.studentCode || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                            {row.email || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{row.fullName}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={openDeleteConfirm(row.eligibilityId)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* CHUẨN HÓA UI: Thêm cấu phần phân trang tích hợp mượt mà bên dưới bảng dữ liệu */}
              {totalElements > 0 && (
                <TablePagination
                  component="div"
                  count={totalElements}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={size}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 20, 50]}
                  labelRowsPerPage="Số dòng/trang:"
                  sx={{ borderTop: 'none', mt: 1 }}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 1.5 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG XÁC NHẬN XÓA CHUẨN UX BẢO VỆ TIẾN TRÌNH RUNTIME */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận gỡ bỏ</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Bạn có chắc chắn muốn xóa sinh viên này khỏi danh sách đủ điều kiện đăng ký nội trú?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)}>Hủy</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Xác Nhận Xóa
          </Button>
        </DialogActions>
      </Dialog>
      {/* DIALOG XÁC NHẬN XÓA TẤT CẢ */}
      <Dialog open={confirmDeleteAllOpen} onClose={() => setConfirmDeleteAllOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
          Xác nhận xóa toàn bộ
        </DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Bạn có chắc chắn muốn xóa <strong>TẤT CẢ</strong> sinh viên hợp lệ của đợt này? Hành
            động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setConfirmDeleteAllOpen(false)} sx={{ borderRadius: 1.5 }}>
            Hủy bỏ
          </Button>
          <Button
            onClick={() => {
              confirmDeleteAll();
              setConfirmDeleteAllOpen(false);
            }}
            variant="contained"
            color="error"
            sx={{ borderRadius: 1.5 }}
          >
            Xác nhận xóa tất cả
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
