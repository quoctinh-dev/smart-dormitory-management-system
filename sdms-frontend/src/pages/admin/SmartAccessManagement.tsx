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
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useSmartAccess } from '@/hooks/useSmartAccess';

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

  useEffect(() => {
    fetchHistory(page, rowsPerPage);
  }, [fetchHistory, page, rowsPerPage]);

  const onRemoteUnlockSubmit = async () => {
    if (!gateId) return;
    await handleRemoteUnlock(gateId, buildingId);
    setUnlockDialogOpen(false);
    setGateId('');
  };

  const onEmergencySubmit = async () => {
    if (!reason) return;
    await handleEmergencyOverride(actionType, reason);
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
          >
            Mở Cổng Từ Xa
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<WarningAmberIcon />}
            onClick={() => setEmergencyDialogOpen(true)}
            disableElevation
          >
            Tác Động Khẩn Cấp
          </Button>
        </Stack>
      </Box>

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
                  <TableCell sx={{ fontWeight: 'bold' }}>Lý Do</TableCell>
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
                    <TableCell>{row.denialReason || '-'}</TableCell>
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
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <WarningAmberIcon /> Tác Động Khẩn Cấp
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Lệnh khẩn cấp sẽ ghi đè mọi Policy (giờ giới nghiêm, vân vân) trên toàn bộ hệ thống
            Edge.
          </Typography>

          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Loại lệnh</InputLabel>
            <Select
              value={actionType}
              label="Loại lệnh"
              onChange={(e) => setActionType(e.target.value)}
            >
              <MenuItem value="GLOBAL_LOCKDOWN">Khóa Toàn Bộ Cửa (Lockdown)</MenuItem>
              <MenuItem value="GLOBAL_UNLOCK">Mở Toàn Bộ Cửa (Evacuation)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Lý do kích hoạt (Bắt buộc)"
            fullWidth
            multiline
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEmergencyDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={onEmergencySubmit}
            variant="contained"
            color="error"
            disabled={!reason.trim()}
          >
            Phát Lệnh {actionType === 'GLOBAL_LOCKDOWN' ? 'Lockdown' : 'Unlock'}
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
