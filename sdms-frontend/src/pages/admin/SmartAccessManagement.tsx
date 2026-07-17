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
  Tabs,
  Tab,
  Grid,
  Avatar,
  IconButton
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';

import roomApi from '@/api/roomApi';
import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useSmartAccess } from '@/hooks/useSmartAccess';

const DENIAL_REASONS_MAP: Record<string, string> = {
  CURFEW_VIOLATION: 'Vi phạm giờ giới nghiêm',
  OUTSIDE_TIME_WINDOW: 'Sai khung giờ quy định',
  UNAUTHORIZED_OR_INACTIVE: 'Tài khoản không hợp lệ/Chưa đăng ký',
  UNREGISTERED_OR_INACTIVE_GATE: 'Cổng không hợp lệ',
  NOT_ASSIGNED_TO_ROOM: 'Sai phòng/Không có quyền',
  NOT_ASSIGNED_TO_BUILDING: 'Sai tòa nhà',
};

export default function SmartAccessManagement() {
  const {
    history,
    totalElements,
    loading,
    fetchHistory,
    handleRemoteUnlock,
    handleEmergencyOverride,
    curfewRequests,
    totalCurfewRequests,
    fetchCurfewRequests,
    updateCurfewRequestStatus,
  } = useSmartAccess();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog State
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);

  // Unlock Form
  const [gateId, setGateId] = useState('');
  const [buildingId] = useState('00000000-0000-0000-0000-000000000000');

  // Snapshot Viewer
  const [snapshotViewerOpen, setSnapshotViewerOpen] = useState(false);
  const [currentSnapshot, setCurrentSnapshot] = useState('');

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
        setBuildings(Array.isArray(res) ? res : (res as any)?.data || []);
      } catch (err) {
        console.error('Failed to load buildings', err);
      }
    };
    fetchBuildings();
  }, []);

  // Tabs State
  const [activeTab, setActiveTab] = useState(0);

  // Search State
  const [searchStudentId, setSearchStudentId] = useState('');
  const [filterGateId, setFilterGateId] = useState('');
  const [filterDecision, setFilterDecision] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    fetchHistory(page, rowsPerPage, searchStudentId, {
      gateId: filterGateId,
      decision: filterDecision,
      startDate: filterStartDate ? new Date(filterStartDate).toISOString() : undefined,
      endDate: filterEndDate ? new Date(filterEndDate).toISOString() : undefined
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchHistory, page, rowsPerPage]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchCurfewRequests(0, 10);
    }
  }, [activeTab, fetchCurfewRequests]);

  const handleSearchClick = () => {
    setPage(0); // Reset về trang 1 khi search
    fetchHistory(0, rowsPerPage, searchStudentId, {
      gateId: filterGateId,
      decision: filterDecision,
      startDate: filterStartDate ? new Date(filterStartDate).toISOString() : undefined,
      endDate: filterEndDate ? new Date(filterEndDate).toISOString() : undefined
    });
  };

  const handleClearSearch = () => {
    setSearchStudentId('');
    setFilterGateId('');
    setFilterDecision('');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(0);
    fetchHistory(0, rowsPerPage, '', {});
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="Lịch Sử Ra Vào (Audit Log)" />
          <Tab label="Yêu Cầu Vào Trễ (Curfew Requests)" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <>
      {/* Tầng Search (Targeted View cho Admin) */}
      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Tra cứu & Lọc:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              size="small"
              fullWidth
              label="ID Sinh viên (UUID)"
              value={searchStudentId}
              onChange={(e) => setSearchStudentId(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              size="small"
              fullWidth
              label="Mã Cổng (Gate ID)"
              value={filterGateId}
              onChange={(e) => setFilterGateId(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Quyết định</InputLabel>
              <Select
                value={filterDecision}
                label="Quyết định"
                onChange={(e) => setFilterDecision(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="GRANTED">Thành công (GRANTED)</MenuItem>
                <MenuItem value="DENIED">Từ chối (DENIED)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              size="small"
              fullWidth
              type="datetime-local"
              label="Từ ngày"
              InputLabelProps={{ shrink: true }}
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              size="small"
              fullWidth
              type="datetime-local"
              label="Đến ngày"
              InputLabelProps={{ shrink: true }}
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
          <Button variant="contained" onClick={handleSearchClick} disabled={loading}>
            Tìm kiếm
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearSearch}
            disabled={loading}
          >
            Xóa Lọc
          </Button>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, mb: 4, overflow: 'hidden' }}>

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
                  <TableCell sx={{ fontWeight: 'bold' }}>Ảnh (Audit)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Lý Do / Chẩn Đoán</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.id} hover>
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
                    <TableCell align="center">
                      {row.snapshotUrl ? (
                        <IconButton 
                          color="primary" 
                          onClick={() => {
                            setCurrentSnapshot(row.snapshotUrl || '');
                            setSnapshotViewerOpen(true);
                          }}
                        >
                          <Avatar src={row.snapshotUrl} sx={{ width: 32, height: 32, border: '1px solid #ccc' }}>
                            <PhotoCameraIcon fontSize="small" />
                          </Avatar>
                        </IconButton>
                      ) : (
                        <Typography variant="caption" color="text.disabled">Không có</Typography>
                      )}
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
                              row.denialReason === 'UNAUTHORIZED_OR_INACTIVE' || row.denialReason === 'NOT_ASSIGNED_TO_ROOM'
                                ? 'error.main'
                                : 'warning.main',
                            fontWeight: 'medium',
                          }}
                        >
                          {DENIAL_REASONS_MAP[row.denialReason] || row.denialReason}
                        </Typography>
                      ) : (
                        '-'
                      )}
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
          labelRowsPerPage="Số dòng/trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} trong ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>
      </>
      )}

      {activeTab === 1 && (
        <Paper variant="outlined" sx={{ borderRadius: 3, mb: 4, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              <CustomSkeleton type="table" count={5} />
            </Box>
          ) : curfewRequests.length === 0 ? (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <WarningAmberIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography sx={{ color: 'text.secondary' }}>Chưa có yêu cầu vào trễ nào cần xử lý.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Thời Gian Y/C</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sinh Viên</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Giờ Dự Kiến Về</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lý Do</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Thao Tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {curfewRequests.map((req) => (
                    <TableRow key={req.requestId} hover>
                      <TableCell>{new Date(req.createdAt).toLocaleString('vi-VN')}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{req.studentName}</Typography>
                        <Typography variant="caption" color="text.secondary">{req.studentCode}</Typography>
                      </TableCell>
                      <TableCell>
                        {req.expectedArrivalTime ? new Date(req.expectedArrivalTime).toLocaleString('vi-VN') : 'N/A'}
                      </TableCell>
                      <TableCell>{req.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={req.status}
                          color={req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'error' : 'warning'}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        {req.status === 'PENDING' && (
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => updateCurfewRequestStatus(req.requestId, 'APPROVED')}
                            >
                              Duyệt
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => updateCurfewRequestStatus(req.requestId, 'REJECTED')}
                            >
                              Từ Chối
                            </Button>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

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

      {/* Dialog: Snapshot Viewer */}
      <Dialog
        open={snapshotViewerOpen}
        onClose={() => setSnapshotViewerOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Hình Ảnh Đối Chứng (Audit Snapshot)</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 2 }}>
          {currentSnapshot ? (
            <img 
              src={currentSnapshot} 
              alt="Snapshot" 
              style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '8px', objectFit: 'contain' }} 
            />
          ) : (
            <Typography>Không tải được hình ảnh</Typography>
          )}
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
            Ảnh chụp từ ESP32-CAM tại thời điểm quẹt thẻ (Fallback Method). Admin vui lòng đối chiếu để phát hiện hành vi mượn thẻ.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSnapshotViewerOpen(false)} variant="contained">Đóng</Button>
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
            ⚠️ Cảnh báo: Lệnh này sẽ ghi đè mọi Policy (giờ giới nghiêm, vân vân) trên toàn bộ hệ
            thống Edge. Chỉ sử dụng trong tình huống nguy hiểm thực sự.
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Phạm vi áp dụng (Scope)</InputLabel>
            <Select
              value={targetBuilding}
              label="Phạm vi áp dụng (Scope)"
              onChange={(e) => setTargetBuilding(e.target.value)}
              sx={{ fontWeight: 'bold' }}
            >
              <MenuItem value="ALL" sx={{ fontWeight: 'bold' }}>
                🌐 TOÀN BỘ KÝ TÚC XÁ (Campus-wide)
              </MenuItem>
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
              sx={{
                fontWeight: 'bold',
                color: actionType === 'GLOBAL_LOCKDOWN' ? 'error.main' : 'success.main',
              }}
            >
              <MenuItem value="GLOBAL_LOCKDOWN" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                🔴 LOCKDOWN (Khóa toàn bộ cửa)
              </MenuItem>
              <MenuItem value="GLOBAL_UNLOCK" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                🟢 EVACUATION (Mở toàn bộ cửa)
              </MenuItem>
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
          <Button onClick={() => setEmergencyDialogOpen(false)} sx={{ fontWeight: 'bold' }}>
            Hủy Bỏ
          </Button>
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
    </Box>
  );
}
