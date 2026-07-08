import { Delete, CloudUpload } from '@mui/icons-material';
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
  Alert,
  TablePagination,
} from '@mui/material';
import { useRef } from 'react';

import { useEligibilityManager } from '@/hooks/useEligibilityManager';
import { IRegistrationPeriod } from '@/hooks/useRegistrationManagerUi';

interface EligibilityManagerDialogProps {
  open: boolean;
  onClose: () => void;
  period: IRegistrationPeriod | null;
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
    error,
    successMsg,
    deleteTarget,
    page,
    size,
    totalElements,
    setPage,
    setSize,
    setDeleteTarget,
    confirmDelete,
    handleImportExcel,
  } = useEligibilityManager(period, open);

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
          Danh sách đủ điều kiện - {period.periodName}
        </DialogTitle>
        <DialogContent dividers sx={{ pb: 0 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          {successMsg && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {successMsg}
            </Alert>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Tải lên file Excel (.xlsx) gồm cột CCCD và Họ Tên để cấu hình bộ lọc sinh viên.
            </Typography>

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
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 2, maxHeight: '400px' }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                        STT
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                        CCCD / CMND
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                        Mã sinh viên
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                        Họ và tên
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}
                      >
                        Hành động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eligibilities.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
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
                          <TableCell>{row.cccd}</TableCell>
                          <TableCell sx={{ color: 'primary.main', fontWeight: 500 }}>
                            {row.studentCode || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{row.fullName}</TableCell>
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
                  labelRowsPerPage="Số dòng mỗi trang:"
                  labelDisplayedRows={({ from, to, count }) => `${from}–${to} trong ${count}`}
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
    </>
  );
}
