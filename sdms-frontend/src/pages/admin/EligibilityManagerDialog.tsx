import { Delete, CloudUpload, Search, Close } from '@mui/icons-material';
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
  TextField,
  InputAdornment,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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
    setPage(0);
  };

  const openDeleteConfirm = (eligibilityId: string) => () => {
    setDeleteTarget(eligibilityId);
  };

  if (!period) return null;

  return (
      <>
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, pb: 1 }}>
            <Box>
              {period.registrationType === 'OPEN_REGISTRATION'
                  ? 'Danh sách sinh viên ưu tiên'
                  : 'Danh sách đủ điều kiện'}
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 400, mt: 0.5 }}>
                Đợt: {period.periodName}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small" edge="end">
              <Close fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ py: 2 }}>
            {/* Header & Filter Controls */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {period.registrationType === 'OPEN_REGISTRATION'
                    ? 'Tải lên file Excel (.xlsx) gồm các cột CCCD, Họ Tên, MSSV, Email để cấu hình danh sách sinh viên ưu tiên (VD: Năm nhất). Hệ thống vẫn cho phép tất cả sinh viên khác đăng ký bình thường.'
                    : 'Tải lên file Excel (.xlsx) gồm các cột CCCD, Họ Tên, MSSV, Email để cấu hình bộ lọc sinh viên hợp lệ.'}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Tìm kiếm sinh viên..."
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setPage(0);
                    }}
                    sx={{
                      width: { xs: '100%', sm: 260 },
                      '& .MuiOutlinedInput-root': { borderRadius: 1.5 }
                    }}
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

                <Stack direction="row" spacing={1.5}>
                  <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete fontSize="small" />}
                      onClick={() => setConfirmDeleteAllOpen(true)}
                      disabled={totalElements === 0}
                      sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    Xóa tất cả
                  </Button>

                  <input
                      type="file"
                      accept=".xlsx"
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                      onChange={handleFileChange}
                  />
                  <Button
                      variant="contained"
                      disableElevation
                      startIcon={
                        importing ? <CircularProgress size={18} color="inherit" /> : <CloudUpload fontSize="small" />
                      }
                      onClick={() => fileInputRef.current?.click()}
                      disabled={importing}
                      sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    {importing ? 'Đang tải...' : 'Tải lên danh sách'}
                  </Button>
                </Stack>
              </Stack>
            </Box>

            {/* Data Table */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                  <CircularProgress size={32} />
                </Box>
            ) : (
                <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
                  <TableContainer sx={{ maxHeight: 440 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>STT</TableCell>
                          <TableCell sx={{ fontWeight: 600, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>CCCD</TableCell>
                          <TableCell sx={{ fontWeight: 600, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>Mã sinh viên</TableCell>
                          <TableCell sx={{ fontWeight: 600, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 600, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>Họ và tên</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>Thao tác</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {eligibilities.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                Chưa có dữ liệu danh sách hoặc không tìm thấy kết quả phù hợp.
                              </TableCell>
                            </TableRow>
                        ) : (
                            eligibilities.map((row, index) => (
                                <TableRow key={row.eligibilityId} hover>
                                  <TableCell variant="body">{index + 1 + page * size}</TableCell>
                                  <TableCell variant="body" sx={{ fontFamily: 'monospace' }}>{row.cccd || '-'}</TableCell>
                                  <TableCell variant="body" sx={{ fontWeight: 600 }}>{row.studentCode || '-'}</TableCell>
                                  <TableCell variant="body" sx={{ color: 'text.secondary' }}>{row.email || '-'}</TableCell>
                                  <TableCell variant="body" sx={{ fontWeight: 500 }}>{row.fullName}</TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                        color="error"
                                        size="small"
                                        onClick={openDeleteConfirm(row.eligibilityId)}
                                        title="Xóa khỏi danh sách"
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
                          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
                      />
                  )}
                </Paper>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
                onClick={onClose}
                color="inherit"
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 500 }}
            >
              Đóng cửa sổ
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog xác nhận xóa một */}
        <Dialog
            open={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Xác nhận gỡ bỏ</DialogTitle>
          <DialogContent sx={{ minWidth: { xs: 280, sm: 360 }, py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Bạn có chắc chắn muốn xóa sinh viên này khỏi danh sách đủ điều kiện đăng ký nội trú?
              Hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
                onClick={() => setDeleteTarget(null)}
                color="inherit"
                sx={{ borderRadius: 1.5, textTransform: 'none' }}
            >
              Hủy bỏ
            </Button>
            <Button
                onClick={confirmDelete}
                variant="contained"
                color="error"
                disableElevation
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Xác nhận xóa
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog xác nhận xóa tất cả */}
        <Dialog
            open={confirmDeleteAllOpen}
            onClose={() => setConfirmDeleteAllOpen(false)}
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, color: 'error.main', pb: 1 }}>
            Cảnh báo xóa toàn bộ
          </DialogTitle>
          <DialogContent sx={{ minWidth: { xs: 280, sm: 360 }, py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Bạn có chắc chắn muốn xóa <strong>TẤT CẢ</strong> sinh viên hợp lệ của đợt này? Toàn bộ danh sách hiện tại sẽ bị làm trống và hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
                onClick={() => setConfirmDeleteAllOpen(false)}
                color="inherit"
                sx={{ borderRadius: 1.5, textTransform: 'none' }}
            >
              Hủy bỏ
            </Button>
            <Button
                onClick={() => {
                  confirmDeleteAll();
                  setConfirmDeleteAllOpen(false);
                }}
                variant="contained"
                color="error"
                disableElevation
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Xóa tất cả
            </Button>
          </DialogActions>
        </Dialog>
      </>
  );
}