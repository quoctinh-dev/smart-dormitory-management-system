import {
  Edit,
  PlayCircleOutline,
  PauseCircleOutline,
  Group,
  Search,
  FilterList,
} from '@mui/icons-material';
import {
  Container,
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
  } = useRegistrationManagerUi();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const displayedPeriods = periods.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading && periods.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <CustomSkeleton type="table" />
      </Box>
    );
  }

  return (
    <Box>
      {/* HEADER TỔNG QUAN */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Quản lý đợt đăng ký
        </Typography>
        <Button variant="contained" onClick={handleOpenCreate} sx={{ borderRadius: 2 }}>
          + Tạo đợt mới
        </Button>
      </Box>

      {/* Filter Options */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2, color: 'text.secondary' }}>
          <FilterList fontSize="small" />
          <Typography variant="body2" fontWeight="bold">
            Bộ lọc
          </Typography>
        </Box>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Tìm kiếm theo tên đợt..."
          value={filterKeyword}
          onChange={(e) => {
            setFilterKeyword(e.target.value);
            setPage(0);
          }}
          sx={{ width: { xs: '100%', sm: 300 }, bgcolor: '#ffffff', borderRadius: 1 }}
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
        <FormControl
          size="small"
          variant="outlined"
          sx={{ width: { xs: '100%', sm: 200 }, bgcolor: '#ffffff', borderRadius: 1 }}
        >
          <InputLabel>Loại cấu hình</InputLabel>
          <Select
            label="Loại cấu hình"
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
        <FormControl
          size="small"
          variant="outlined"
          sx={{ width: { xs: '100%', sm: 150 }, bgcolor: '#ffffff', borderRadius: 1 }}
        >
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
        <FormControl
          size="small"
          variant="outlined"
          sx={{ width: { xs: '100%', sm: 200 }, bgcolor: '#ffffff', borderRadius: 1 }}
        >
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
            <MenuItem value="INACTIVE">Không hoạt động</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Main Grid/Table Wrapper */}
      <TableContainer component={Paper} sx={{ overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Tên đợt</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Loại cấu hình</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Bắt đầu</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Kết thúc</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {periods.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 6, color: 'text.secondary', fontStyle: 'italic' }}
                >
                  Hệ thống chưa ghi nhận đợt đăng ký nội trú nào.
                </TableCell>
              </TableRow>
            ) : (
              displayedPeriods.map((row) => (
                <TableRow key={row.periodId} hover>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      maxWidth: 220,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Tooltip title={row.periodName} placement="top-start">
                      <span>{row.periodName}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {REGISTRATION_TYPES[row.registrationType] || row.registrationType}
                  </TableCell>
                  <TableCell>{new Date(row.startDate).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>{new Date(row.endDate).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                      color={row.isActive ? 'success' : 'warning'}
                      variant={row.isActive ? 'filled' : 'outlined'}
                      size="small"
                      sx={{ fontWeight: 'bold', borderRadius: 1.5 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Tooltip
                        title={
                          row.registrationType === 'CURRENT_RESIDENT'
                            ? 'Đợt gia hạn không dùng danh sách'
                            : row.registrationType === 'OPEN_REGISTRATION'
                              ? 'Danh sách ưu tiên'
                              : 'Danh sách đủ điều kiện'
                        }
                      >
                        <span>
                          <IconButton
                            color="info"
                            size="small"
                            onClick={handleOpenEligibility(row)}
                            disabled={row.registrationType === 'CURRENT_RESIDENT'}
                          >
                            <Group fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" onClick={handleOpenEdit(row)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={row.isActive ? 'Tạm dừng' : 'Kích hoạt'}>
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
                    </Box>
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
        labelRowsPerPage="Số dòng:"
      />

      {/* FORM DIALOG - CHUẨN HOÁ LOGIC CHỈNH SỬA & TRUYỀN TẢI DỮ LIỆU */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editMode ? 'Cập nhật đợt đăng ký' : 'Tạo đợt đăng ký mới'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Tên đợt"
                  value={formData.periodName}
                  onChange={handleFormChange('periodName')}
                  required
                />
              </Grid>

              {/* CHUẨN HÓA: Ở chế độ sửa, disable không cho đổi loại đợt (để tránh lỗi danh sách Excel) nhưng vẫn hiển thị tường minh */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  label="Loại cấu hình đợt"
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
                  type="datetime-local"
                  label="Ngày bắt đầu"
                  value={formData.startDate}
                  onChange={handleFormChange('startDate')}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Ngày kết thúc đăng ký"
                  value={formData.endDate}
                  onChange={handleFormChange('endDate')}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Ngày bắt đầu lưu trú"
                  value={formData.stayStartDate || ''}
                  onChange={handleFormChange('stayStartDate')}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Ngày kết thúc lưu trú"
                  value={formData.stayEndDate || ''}
                  onChange={handleFormChange('stayEndDate')}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmitPeriod} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Lưu lại'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUB-DIALOGS & ALERTS */}
      <EligibilityManagerDialog
        open={eligibilityDialogOpen}
        onClose={handleCloseEligibility}
        period={selectedPeriodForEligibility}
      />

      <Dialog
        open={activationConfirmOpen}
        onClose={handleCloseActivationConfirm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Kích hoạt đợt đăng ký</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">
            Kích hoạt đợt này sẽ tự động dừng các đợt đăng ký khác đang mở để đảm bảo chỉ có một đợt
            hoạt động.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bạn có muốn tiếp tục không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseActivationConfirm}>Hủy</Button>
          <Button
            onClick={handleConfirmActivation}
            variant="contained"
            color="success"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Kích hoạt'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
