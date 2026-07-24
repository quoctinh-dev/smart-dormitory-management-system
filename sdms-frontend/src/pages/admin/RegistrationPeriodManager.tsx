import {
  Edit,
  PlayCircleOutline,
  PauseCircleOutline,
  Group,
  Search,
  FilterList,
  Delete,
} from '@mui/icons-material';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Chip,
  Tooltip,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useRegistrationManagerUi } from '@/hooks/useRegistrationManagerUi';

import EligibilityManagerDialog from './EligibilityManagerDialog';

const REGISTRATION_TYPES: Record<string, string> = {
  CURRENT_RESIDENT: 'Sinh viên đang lưu trú',
  NEW_STUDENT: 'Tân sinh viên',
  OPEN_REGISTRATION: 'Mở tự do',
};

export default function RegistrationPeriodManager() {
  const {
    periods,
    loading,
    isSubmitting,
    filterKeyword,
    setFilterKeyword,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    filterYear,
    setFilterYear,
    availableYears,
    openDialog,
    editMode,
    formData,
    eligibilityDialogOpen,
    selectedPeriodForEligibility,
    activationConfirmOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenEligibility,
    handleCloseDialog,
    handleCloseEligibility,
    handleCloseActivationConfirm,
    handleConfirmActivation,
    handleFormChange,
    handleSubmitPeriod,
    handleToggleStatus,
    handleDelete,
  } = useRegistrationManagerUi();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const displayedPeriods = periods.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading && periods.length === 0) {
    return (
        <Box sx={{ py: 3 }}>
          <CustomSkeleton type="table" />
        </Box>
    );
  }

  return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header trang */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Quản lý đợt đăng ký
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cấu hình thời gian, loại đợt và danh sách đủ điều kiện đăng ký nội trú KTX.
            </Typography>
          </Box>
          <Button
              variant="contained"
              onClick={handleOpenCreate}
              disableElevation
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
          >
            Tạo đợt mới
          </Button>
        </Box>

        {/* Thanh bộ lọc */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
                size="small"
                placeholder="Tìm theo tên đợt..."
                value={filterKeyword}
                onChange={(e) => {
                  setFilterKeyword(e.target.value);
                  setPage(0);
                }}
                sx={{ minWidth: { xs: '100%', sm: 260 } }}
                slotProps={{
                  input: {
                    startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                    ),
                  },
                }}
            />

            <FormControl size="small" sx={{ minWidth: 180, width: { xs: '100%', sm: 'auto' } }}>
              <InputLabel>Loại đợt</InputLabel>
              <Select
                  label="Loại đợt"
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setPage(0);
                  }}
              >
                <MenuItem value="ALL">Tất cả loại</MenuItem>
                <MenuItem value="OPEN_REGISTRATION">Mở tự do</MenuItem>
                <MenuItem value="NEW_STUDENT">Tân sinh viên</MenuItem>
                <MenuItem value="CURRENT_RESIDENT">Sinh viên đang lưu trú</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140, width: { xs: '100%', sm: 'auto' } }}>
              <InputLabel>Năm học</InputLabel>
              <Select
                  label="Năm học"
                  value={filterYear}
                  onChange={(e) => {
                    setFilterYear(e.target.value);
                    setPage(0);
                  }}
              >
                <MenuItem value="ALL">Tất cả năm</MenuItem>
                {availableYears.map((year) => (
                    <MenuItem key={year} value={year}>
                      Năm {year}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160, width: { xs: '100%', sm: 'auto' } }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                  label="Trạng thái"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(0);
                  }}
              >
                <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
                <MenuItem value="INACTIVE">Tạm dừng</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Bảng danh sách đợt đăng ký */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tên đợt đăng ký</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Loại cấu hình</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Thời gian đăng ký</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Thời gian lưu trú</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {periods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary" variant="body2">
                          Chưa ghi nhận đợt đăng ký nội trú nào.
                        </Typography>
                      </TableCell>
                    </TableRow>
                ) : (
                    displayedPeriods.map((row) => (
                        <TableRow key={row.periodId} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {row.periodName}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {REGISTRATION_TYPES[row.registrationType] || row.registrationType}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {new Date(row.startDate).toLocaleString('vi-VN')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Đến: {new Date(row.endDate).toLocaleString('vi-VN')}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {row.stayStartDate ? new Date(row.stayStartDate).toLocaleDateString('vi-VN') : '-'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Đến: {row.stayEndDate ? new Date(row.stayEndDate).toLocaleDateString('vi-VN') : '-'}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                                label={row.isActive ? 'Đang mở' : 'Tạm dừng'}
                                color={row.isActive ? 'success' : 'default'}
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <Tooltip
                                  title={
                                    row.registrationType === 'CURRENT_RESIDENT'
                                        ? 'Đợt gia hạn không sử dụng danh sách'
                                        : 'Quản lý danh sách đủ điều kiện'
                                  }
                              >
                          <span>
                            <IconButton
                                color="primary"
                                size="small"
                                onClick={handleOpenEligibility(row)}
                                disabled={row.registrationType === 'CURRENT_RESIDENT'}
                            >
                              <Group fontSize="small" />
                            </IconButton>
                          </span>
                              </Tooltip>

                              <Tooltip title="Chỉnh sửa thông tin">
                                <IconButton size="small" onClick={handleOpenEdit(row)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title={row.isActive ? 'Tạm dừng đợt' : 'Kích hoạt đợt'}>
                                <IconButton
                                    color={row.isActive ? 'warning' : 'success'}
                                    size="small"
                                    onClick={handleToggleStatus(row.periodId, row.isActive)}
                                >
                                  {row.isActive ? (
                                      <PauseCircleOutline fontSize="small" />
                                  ) : (
                                      <PlayCircleOutline fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Xóa cứng đợt đăng ký">
                                <IconButton color="error" size="small" onClick={() => handleDelete(row.periodId)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={periods.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Số dòng mỗi trang:"
          />
        </Paper>

        {/* Dialog tạo/sửa đợt đăng ký */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
            {editMode ? 'Chỉnh sửa đợt đăng ký' : 'Tạo đợt đăng ký mới'}
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                    fullWidth
                    size="small"
                    label="Tên đợt đăng ký"
                    value={formData.periodName}
                    onChange={handleFormChange('periodName')}
                    required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                    select
                    fullWidth
                    size="small"
                    label="Loại đợt đăng ký"
                    value={formData.registrationType}
                    onChange={handleFormChange('registrationType')}
                    disabled={editMode}
                >
                  {Object.entries(REGISTRATION_TYPES).map(([k, v]) => (
                      <MenuItem key={k} value={k}>
                        {v}
                      </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    label="Bắt đầu nhận đơn"
                    value={formData.startDate}
                    onChange={handleFormChange('startDate')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    label="Kết thúc nhận đơn"
                    value={formData.endDate}
                    onChange={handleFormChange('endDate')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Bắt đầu ở"
                    value={formData.stayStartDate || ''}
                    onChange={handleFormChange('stayStartDate')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Kết thúc ở"
                    value={formData.stayEndDate || ''}
                    onChange={handleFormChange('stayEndDate')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
              Hủy bỏ
            </Button>
            <Button
                onClick={handleSubmitPeriod}
                variant="contained"
                disableElevation
                disabled={isSubmitting}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Lưu thông tin'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog quản lý danh sách ưu tiên/đủ điều kiện */}
        <EligibilityManagerDialog
            open={eligibilityDialogOpen}
            onClose={handleCloseEligibility}
            period={selectedPeriodForEligibility}
        />

        {/* Dialog xác nhận kích hoạt */}
        <Dialog
            open={activationConfirmOpen}
            onClose={handleCloseActivationConfirm}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Kích hoạt đợt đăng ký</DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            <Typography variant="body2">
              Khi kích hoạt đợt này, các đợt đăng ký khác đang mở sẽ tự động chuyển sang trạng thái tạm dừng.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Xác nhận tiếp tục?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseActivationConfirm} color="inherit" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
              Hủy bỏ
            </Button>
            <Button
                onClick={handleConfirmActivation}
                variant="contained"
                color="success"
                disableElevation
                disabled={isSubmitting}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Kích hoạt'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}