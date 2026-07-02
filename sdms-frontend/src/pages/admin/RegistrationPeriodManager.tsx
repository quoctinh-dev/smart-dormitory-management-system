import { Edit, PlayCircleOutline, PauseCircleOutline, Group } from '@mui/icons-material';
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
  Snackbar,
  Alert,
  Box,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';

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
    error,
    openDialog,
    editMode,
    formData,
    snackbar,
    eligibilityDialogOpen,
    selectedPeriodForEligibility,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenEligibility,
    handleCloseDialog,
    handleCloseEligibility,
    handleFormChange,
    handleCloseSnackbar,
    handleSubmitPeriod,
    handleToggleStatus,
  } = useRegistrationManagerUi();

  if (loading && periods.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <CustomSkeleton type="table" />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }} maxWidth="lg">
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Quản lý Đợt đăng ký
        </Typography>
        <Button variant="contained" onClick={handleOpenCreate} sx={{ borderRadius: 2 }}>
          + Tạo đợt mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Grid/Table Wrapper */}
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 3, borderColor: 'divider', overflow: 'hidden' }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04) }}>
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
              periods.map((row) => (
                <TableRow key={row.periodId} hover>
                  <TableCell
                    sx={{
                      fontWeight: 500,
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
                      color={row.isActive ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 600, borderRadius: 1.5 }}
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
                      {row.registrationType !== 'OPEN_REGISTRATION' && (
                        <Tooltip title="Danh sách đủ điều kiện">
                          <IconButton
                            color="info"
                            size="small"
                            onClick={handleOpenEligibility(row)}
                          >
                            <Group fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
