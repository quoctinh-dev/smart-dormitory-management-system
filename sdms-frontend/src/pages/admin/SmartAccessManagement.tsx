import LockOpenIcon from '@mui/icons-material/LockOpen';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useSmartAccess } from '@/hooks/useSmartAccess';
import roomApi from '@/api/roomApi';

export default function SmartAccessManagement() {
  const {
    history,
    totalElements,
    loading,
    snackbar,
    fetchHistory,
    handleRemoteUnlock,
    handleEmergencyOverride,
    closeSnackbar,
  } = useSmartAccess();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog State
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);

  // Unlock Form
  const [gateId, setGateId] = useState('');
  const [buildingId] = useState('00000000-0000-0000-0000-000000000000');

  // Emergency Form
  const [actionType, setActionType] = useState('GLOBAL_LOCKDOWN');
  const [reason, setReason] = useState('');
  const [confirmEmergency, setConfirmEmergency] = useState(false);
  const [targetBuilding, setTargetBuilding] = useState('ALL');
  const [buildings, setBuildings] = useState<any[]>([]);

  // Fetch Buildings for Scoped Actions
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await roomApi.getBuildings();
        // axiosClient interceptor đã unwrap data, nên res chính là mảng kết quả
        setBuildings(Array.isArray(res) ? res : res?.data || []);
      } catch (err) {
        console.error('Failed to load buildings', err);
      }
    };
    fetchBuildings();
  }, []);

  // Search State
  const [searchStudentId, setSearchStudentId] = useState('');

  useEffect(() => {
    fetchHistory(page, rowsPerPage, searchStudentId);
  }, [fetchHistory, page, rowsPerPage]);

  const handleSearchClick = () => {
    setPage(0); // Reset về trang 1 khi search
    fetchHistory(0, rowsPerPage, searchStudentId);
  };

  const handleClearSearch = () => {
    setSearchStudentId('');
    setPage(0);
    fetchHistory(0, rowsPerPage, '');
  };

  const onRemoteUnlockSubmit = async () => {
    if (!gateId) return;
    await handleRemoteUnlock(gateId, buildingId);
    setUnlockDialogOpen(false);
    setGateId('');
  };

  const onEmergencySubmit = async () => {
    if (!reason) return;
    const finalBuildingId = targetBuilding === 'ALL' ? undefined : targetBuilding;
    await handleEmergencyOverride(actionType, reason, finalBuildingId);
    setEmergencyDialogOpen(false);
    setReason('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Smart Access & IoT Control
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Quản lý và điều khiển hệ thống ra vào thông minh.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<LockOpenIcon />}
            onClick={() => setUnlockDialogOpen(true)}
            disableElevation
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,118,255,0.23)',
              },
            }}
          >
            Mở Cổng Từ Xa
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<WarningAmberIcon />}
            onClick={() => {
              setConfirmEmergency(false);
              setEmergencyDialogOpen(true);
            }}
            disableElevation
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              animation: 'pulseWarning 2s infinite',
              transition: 'all 0.2s ease-in-out',
              '@keyframes pulseWarning': {
                '0%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.7)' },
                '70%': { boxShadow: '0 0 0 10px rgba(211, 47, 47, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)' },
              },
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            }}
          >
            Tác Động Khẩn Cấp
          </Button>
        </Stack>
      </Box>

      {/* Tầng Search (Targeted View cho Admin) */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Tra cứu cá nhân:</Typography>
        <TextField
          size="small"
          placeholder="Nhập ID Sinh viên (UUID)..."
          value={searchStudentId}
          onChange={(e) => setSearchStudentId(e.target.value)}
          sx={{ width: 350 }}
        />
        <Button variant="contained" onClick={handleSearchClick} disabled={loading}>
          Tìm kiếm
        </Button>
        {searchStudentId && (
          <Button variant="outlined" color="secondary" onClick={handleClearSearch} disabled={loading}>
            Xóa Lọc
          </Button>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, mb: 4, overflow: 'hidden' }}>
        <Typography
          variant="h6"
          sx={{ p: 2.5, fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider' }}
        >
          Lịch Sử Ra Vào (Audit Log)
        </Typography>

        {loading ? (
          <Box sx={{ p: 3 }}>
            <CustomSkeleton type="table" count={5} />
          </Box>
        ) : history.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary' }}>Chưa có lịch sử ra vào nào.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Thời Gian</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sinh Viên ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cổng (Gate)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Phương Thức</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Lý Do / Chẩn Đoán</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Hỗ trợ Quyết định</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.historyId} hover>
                    <TableCell>{new Date(row.eventTimestamp).toLocaleString('vi-VN')}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {row.studentId === '00000000-0000-0000-0000-000000000000'
                          ? 'N/A (Admin/Operator)'
                          : row.studentId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {row.gateId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.method}
                        size="small"
                        variant="outlined"
                        color={
                          row.method.includes('FACE')
                            ? 'primary'
                            : row.method.includes('RFID')
                              ? 'secondary'
                              : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.decision}
                        color={row.decision === 'GRANTED' ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 'bold', minWidth: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      {row.denialReason ? (
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              row.denialReason === 'UNAUTHORIZED_OR_INACTIVE'
                                ? 'error.main'
                                : 'warning.main',
                            fontWeight: 'medium',
                          }}
                        >
                          {row.denialReason === 'CURFEW_VIOLATION'
                            ? 'Vi phạm giờ giới nghiêm'
                            : row.denialReason === 'OUTSIDE_TIME_WINDOW'
                              ? 'Sai khung giờ quy định'
                              : row.denialReason === 'UNAUTHORIZED_OR_INACTIVE'
                                ? 'Tài khoản không hợp lệ'
                                : row.denialReason}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {row.decision === 'DENIED' &&
                      (row.denialReason === 'CURFEW_VIOLATION' ||
                        row.denialReason === 'OUTSIDE_TIME_WINDOW') ? (
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => {
                            setGateId(row.gateId);
                            setUnlockDialogOpen(true);
                          }}
                        >
                          Mở Cổng Hỗ Trợ
                        </Button>
                      ) : row.decision === 'DENIED' &&
                        row.denialReason === 'UNAUTHORIZED_OR_INACTIVE' ? (
                        <Typography variant="caption" color="error">
                          Yêu cầu xuất trình thẻ
                        </Typography>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số dòng:"
        />
      </Paper>

      {/* Dialog: Remote Unlock */}
      <Dialog
        open={unlockDialogOpen}
        onClose={() => setUnlockDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Mở Cổng Từ Xa</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Hành động này sẽ gửi lệnh qua giao thức MQTT để mở khóa cổng ngay lập tức.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Mã Cổng (Gate ID)"
            fullWidth
            value={gateId}
            onChange={(e) => setGateId(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUnlockDialogOpen(false)}>Hủy</Button>
          <Button onClick={onRemoteUnlockSubmit} variant="contained" disabled={!gateId.trim()}>
            Xác Nhận Mở
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Emergency Override */}
      <Dialog
        open={emergencyDialogOpen}
        onClose={() => setEmergencyDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: '2px solid',
            borderColor: 'error.main',
            boxShadow: '0 8px 32px rgba(211,47,47,0.2)',
          },
        }}
      >
        <Box sx={{ bgcolor: 'error.main', color: 'white', p: 2, textAlign: 'center' }}>
          <WarningAmberIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            CHẾ ĐỘ KHẨN CẤP
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>
            ⚠️ Cảnh báo: Lệnh này sẽ ghi đè mọi Policy (giờ giới nghiêm, vân vân) trên toàn bộ hệ thống Edge. Chỉ sử dụng trong tình huống nguy hiểm thực sự.
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Phạm vi áp dụng (Scope)</InputLabel>
            <Select
              value={targetBuilding}
              label="Phạm vi áp dụng (Scope)"
              onChange={(e) => setTargetBuilding(e.target.value)}
              sx={{ fontWeight: 'bold' }}
            >
              <MenuItem value="ALL" sx={{ fontWeight: 'bold' }}>🌐 TOÀN BỘ KÝ TÚC XÁ (Campus-wide)</MenuItem>
              {buildings.map((b) => (
                <MenuItem key={b.buildingId} value={b.buildingId}>
                  🏢 Chỉ áp dụng cho: {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Loại lệnh kích hoạt</InputLabel>
            <Select
              value={actionType}
              label="Loại lệnh kích hoạt"
              onChange={(e) => setActionType(e.target.value)}
              sx={{ fontWeight: 'bold', color: actionType === 'GLOBAL_LOCKDOWN' ? 'error.main' : 'success.main' }}
            >
              <MenuItem value="GLOBAL_LOCKDOWN" sx={{ color: 'error.main', fontWeight: 'bold' }}>🔴 LOCKDOWN (Khóa toàn bộ cửa)</MenuItem>
              <MenuItem value="GLOBAL_UNLOCK" sx={{ color: 'success.main', fontWeight: 'bold' }}>🟢 EVACUATION (Mở toàn bộ cửa)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Lý do phát lệnh (Bắt buộc)"
            fullWidth
            multiline
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 2, border: '1px dashed grey' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmEmergency}
                  onChange={(e) => setConfirmEmergency(e.target.checked)}
                  color="error"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  Tôi xác nhận tự chịu trách nhiệm pháp lý cho lệnh này.
                </Typography>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
          <Button onClick={() => setEmergencyDialogOpen(false)} sx={{ fontWeight: 'bold' }}>Hủy Bỏ</Button>
          <Button
            onClick={onEmergencySubmit}
            variant="contained"
            color="error"
            disabled={!reason.trim() || !confirmEmergency}
            sx={{ px: 4, fontWeight: 'bold', borderRadius: 2 }}
          >
            PHÁT LỆNH NGAY
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
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
    </Box>
  );
}
