import LockOpenIcon from '@mui/icons-material/LockOpen';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SyncIcon from '@mui/icons-material/Sync';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
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
  Autocomplete,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState, useCallback } from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useSmartAccess } from '@/hooks/useSmartAccess';
import { useAuth } from '@/providers/AuthProvider';
import gateApi from '@/api/gate-api';
import studentApi from '@/api/student-api';
import { GateResponse } from '@/types/gate';
import { StudentProfileResponse } from '@/types/student';
import { debounce } from 'lodash';

const DENIAL_REASONS_MAP: Record<string, string> = {
  CURFEW_VIOLATION: 'Vi phạm giờ giới nghiêm',
  OUTSIDE_TIME_WINDOW: 'Khung giờ không hợp lệ',
  UNAUTHORIZED_OR_INACTIVE: 'Tài khoản chưa đăng ký hoặc bị khóa',
  UNREGISTERED_OR_INACTIVE_GATE: 'Cổng không khả dụng',
  NOT_ASSIGNED_TO_ROOM: 'Chưa phân phòng hoặc không có quyền',
  NOT_ASSIGNED_TO_BUILDING: 'Không thuộc tòa nhà này',
};

export default function SmartAccessManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const {
    history,
    totalElements,
    loading,
    fetchHistory,
    handleRemoteUnlock,
    handleEmergencyOverride,
    handleSyncState,
    curfewRequests,
    totalCurfewRequests,
    fetchCurfewRequests,
    handleUpdateCurfewRequest,
    handleBulkUpdateCurfewRequests,
    outsideStudents,
    loadingOutside,
    fetchOutsideStudents,
    buildings,
    fetchBuildings,
  } = useSmartAccess();

  const [selectedCurfewRequestIds, setSelectedCurfewRequestIds] = useState<string[]>([]);

  const handleSelectAllCurfewRequests = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = curfewRequests
          .filter((req) => req.status === 'PENDING')
          .map((n) => n.requestId);
      setSelectedCurfewRequestIds(newSelecteds);
      return;
    }
    setSelectedCurfewRequestIds([]);
  };

  const handleSelectCurfewRequest = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const selectedIndex = selectedCurfewRequestIds.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedCurfewRequestIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedCurfewRequestIds.slice(1));
    } else if (selectedIndex === selectedCurfewRequestIds.length - 1) {
      newSelected = newSelected.concat(selectedCurfewRequestIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
          selectedCurfewRequestIds.slice(0, selectedIndex),
          selectedCurfewRequestIds.slice(selectedIndex + 1)
      );
    }

    setSelectedCurfewRequestIds(newSelected);
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog State
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);

  // Unlock Form
  const [gateId, setGateId] = useState('');
  const [targetStudentId, setTargetStudentId] = useState('');
  const [buildingId, setBuildingId] = useState('');

  // Dropdown Data State for Unlock Form
  const [allGates, setAllGates] = useState<GateResponse[]>([]);
  const [filteredGates, setFilteredGates] = useState<GateResponse[]>([]);
  const [studentOptions, setStudentOptions] = useState<StudentProfileResponse[]>([]);
  const [studentSearchLoading, setStudentSearchLoading] = useState(false);
  const [selectedGate, setSelectedGate] = useState<GateResponse | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileResponse | null>(null);

  // Fetch Gates on mount
  useEffect(() => {
    gateApi.getAllGates().then((res: any) => {
      setAllGates(res?.data || res || []);
    }).catch(err => console.error(err));
  }, []);

  // Filter gates by buildingId
  useEffect(() => {
    if (buildingId) {
      setFilteredGates(allGates.filter(g => g.buildingId === buildingId));
    } else {
      setFilteredGates([]);
    }
    if (selectedGate && selectedGate.buildingId !== buildingId) {
      setSelectedGate(null);
      setGateId('');
    }
  }, [buildingId, allGates, selectedGate]);

  // Handle student search with debounce
  const fetchStudents = useCallback(
      debounce(async (query: string) => {
        if (!query.trim()) {
          setStudentOptions([]);
          return;
        }
        setStudentSearchLoading(true);
        try {
          const res: any = await studentApi.getAllStudents({ page: 0, size: 20, search: query });
          setStudentOptions(res?.data?.content || res?.content || []);
        } catch (err) {
          console.error('Không thể tải danh sách sinh viên', err);
        } finally {
          setStudentSearchLoading(false);
        }
      }, 500),
      []
  );

  // Snapshot Viewer
  const [snapshotViewerOpen, setSnapshotViewerOpen] = useState(false);
  const [currentSnapshot, setCurrentSnapshot] = useState('');

  // Emergency Form
  const [actionType, setActionType] = useState('GLOBAL_LOCKDOWN');
  const [reason, setReason] = useState('');
  const [confirmEmergency, setConfirmEmergency] = useState(false);
  const [targetBuilding, setTargetBuilding] = useState('ALL');

  // Fetch Buildings for Scoped Actions
  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  // Tabs State
  const [activeTab, setActiveTab] = useState(0);

  // Search State
  const [searchStudentId, setSearchStudentId] = useState('');
  const [filterGateId, setFilterGateId] = useState('');
  const [filterDecision, setFilterDecision] = useState('');
  const [filterBuildingId, setFilterBuildingId] = useState('');
  const [filterSelectedGate, setFilterSelectedGate] = useState<GateResponse | null>(null);
  const [filterSelectedStudent, setFilterSelectedStudent] = useState<StudentProfileResponse | null>(null);

  const filterGatesList = allGates.filter(g => !filterBuildingId || g.buildingId === filterBuildingId);

  // Local filter state for outside students
  const [filterOutsideBuildingName, setFilterOutsideBuildingName] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // IoT Hardware Alert
  const [iotHardwareAlert, setIotHardwareAlert] = useState<{ title: string; message: string; id: number } | null>(null);

  useEffect(() => {
    const checkHardwareAlerts = async () => {
      try {
        const { notificationApi } = await import('@/api/notification-api');
        const notifications = await notificationApi.getNotifications();
        const hwAlert = (notifications as any[]).find(
            (n: any) => n.type === 'IOT_HARDWARE_ERROR' && !n.isRead && !n.read
        );
        if (hwAlert) {
          setIotHardwareAlert({ title: hwAlert.title, message: hwAlert.message, id: hwAlert.id });
        }
      } catch {
        // Bỏ qua lỗi kết nối thông báo ngầm
      }
    };
    checkHardwareAlerts();
    const interval = setInterval(checkHardwareAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync State Dialog
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncStudentId, setSyncStudentId] = useState('');
  const [syncDirection, setSyncDirection] = useState<'IN' | 'OUT'>('IN');
  const [syncReason, setSyncReason] = useState('');
  const [syncStudent, setSyncStudent] = useState<StudentProfileResponse | null>(null);
  const [syncStudentQuery, setSyncStudentQuery] = useState('');
  const [syncStudentLoading, setSyncStudentLoading] = useState(false);
  const [syncStudentOptions, setSyncStudentOptions] = useState<StudentProfileResponse[]>([]);

  const fetchSyncStudents = useCallback(
      debounce(async (query: string) => {
        if (!query.trim()) { setSyncStudentOptions([]); return; }
        setSyncStudentLoading(true);
        try {
          const res: any = await studentApi.getAllStudents({ page: 0, size: 20, search: query });
          setSyncStudentOptions(res?.data?.content || res?.content || []);
        } catch {} finally {
          setSyncStudentLoading(false);
        }
      }, 400),
      []
  );

  const [curfewFilterStatus, setCurfewFilterStatus] = useState('PENDING');

  useEffect(() => {
    if (activeTab === 0) {
      fetchHistory(page, rowsPerPage, searchStudentId, {
        gateId: filterGateId,
        decision: filterDecision,
        startDate: filterStartDate ? new Date(filterStartDate).toISOString() : undefined,
        endDate: filterEndDate ? new Date(filterEndDate).toISOString() : undefined,
      });
    } else if (activeTab === 1) {
      fetchCurfewRequests(page, rowsPerPage, curfewFilterStatus === 'ALL' ? undefined : curfewFilterStatus);
      setSelectedCurfewRequestIds([]);
    } else if (activeTab === 2) {
      fetchOutsideStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, rowsPerPage, curfewFilterStatus]);

  const handleSearchClick = () => {
    setPage(0);
    fetchHistory(0, rowsPerPage, searchStudentId, {
      gateId: filterGateId,
      decision: filterDecision,
      startDate: filterStartDate ? new Date(filterStartDate).toISOString() : undefined,
      endDate: filterEndDate ? new Date(filterEndDate).toISOString() : undefined,
    });
  };

  const handleClearSearch = () => {
    setSearchStudentId('');
    setFilterGateId('');
    setFilterDecision('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterBuildingId('');
    setFilterSelectedGate(null);
    setFilterSelectedStudent(null);
    setPage(0);
    fetchHistory(0, rowsPerPage, '', {});
  };

  const onRemoteUnlockSubmit = async () => {
    if (!gateId) return;
    await handleRemoteUnlock(gateId, buildingId, targetStudentId || undefined);
    setUnlockDialogOpen(false);
    setGateId('');
    setTargetStudentId('');
  };

  const onEmergencySubmit = async () => {
    if (!reason || !targetBuilding) return;
    await handleEmergencyOverride(actionType, reason, targetBuilding === 'ALL' ? undefined : targetBuilding);
    setEmergencyDialogOpen(false);
    setReason('');
    setConfirmEmergency(false);
  };

  const handleOpenUnlockDialog = () => {
    setUnlockDialogOpen(true);
    setGateId('');
    setTargetStudentId('');
    setSelectedGate(null);
    setSelectedStudent(null);
    setStudentOptions([]);
    if (buildings && buildings.length > 0) {
      setBuildingId(buildings[0].id);
    } else {
      setBuildingId('');
    }
  };

  return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header chính */}
        <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
              mb: 3,
            }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Quản lý ra vào KTX
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Theo dõi lượt ra vào, duyệt đơn xin trễ và điều khiển các thiết bị cổng kiểm soát.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
                variant="contained"
                color="primary"
                startIcon={<LockOpenIcon />}
                onClick={handleOpenUnlockDialog}
                disableElevation
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Mở cổng từ xa
            </Button>

            {isAdmin && (
                <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<SyncIcon />}
                    onClick={() => {
                      setSyncStudent(null);
                      setSyncStudentId('');
                      setSyncStudentQuery('');
                      setSyncDirection('IN');
                      setSyncReason('');
                      setSyncDialogOpen(true);
                    }}
                    sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                  Cập nhật trạng thái
                </Button>
            )}

            {isAdmin && (
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<WarningAmberIcon />}
                    onClick={() => {
                      setConfirmEmergency(false);
                      setEmergencyDialogOpen(true);
                    }}
                    disableElevation
                    sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                  Lệnh khẩn cấp
                </Button>
            )}
          </Stack>
        </Box>

        {/* Cảnh báo sự cố từ hệ thống */}
        {iotHardwareAlert && (
            <Alert
                severity="error"
                onClose={() => setIotHardwareAlert(null)}
                sx={{ mb: 3, borderRadius: 1.5 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {iotHardwareAlert.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {iotHardwareAlert.message}
              </Typography>
            </Alert>
        )}

        {/* Các Tab điều hướng */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
              value={activeTab}
              onChange={(e, val) => {
                setActiveTab(val);
                setPage(0);
              }}
              textColor="primary"
              indicatorColor="primary"
          >
            <Tab label="Lịch sử ra vào" sx={{ fontWeight: 600, textTransform: 'none' }} value={0} />
            {isAdmin && <Tab label="Yêu cầu vào trễ" sx={{ fontWeight: 600, textTransform: 'none' }} value={1} />}
            <Tab label="Sinh viên vắng mặt" sx={{ fontWeight: 600, textTransform: 'none' }} value={2} />
          </Tabs>
        </Box>

        {/* TAB 0: Lịch sử ra vào */}
        {activeTab === 0 && (
            <>
              <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Tra cứu dữ liệu
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tòa nhà</InputLabel>
                      <Select
                          value={filterBuildingId}
                          label="Tòa nhà"
                          onChange={(e) => {
                            setFilterBuildingId(e.target.value);
                            setFilterSelectedGate(null);
                            setFilterGateId('');
                          }}
                      >
                        <MenuItem value="">Tất cả tòa nhà</MenuItem>
                        {buildings.map((b) => (
                            <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Autocomplete
                        size="small"
                        options={filterGatesList}
                        getOptionLabel={(option) => option.name || 'Cổng chưa đặt tên'}
                        value={filterSelectedGate}
                        onChange={(_, newValue) => {
                          setFilterSelectedGate(newValue);
                          setFilterGateId(newValue?.gateId || '');
                        }}
                        renderInput={(params) => <TextField {...params} label="Cổng kiểm soát" fullWidth />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Autocomplete
                        size="small"
                        options={studentOptions}
                        getOptionLabel={(option) => `${option.studentCode} - ${option.fullName}`}
                        value={filterSelectedStudent}
                        onInputChange={(_, newInputValue) => fetchStudents(newInputValue)}
                        onChange={(_, newValue) => {
                          setFilterSelectedStudent(newValue);
                          setSearchStudentId(newValue?.studentId || '');
                        }}
                        isOptionEqualToValue={(option, value) => option.studentId === value.studentId}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} key={option.studentId}>
                              <Avatar src={option.avatarUrl} sx={{ width: 24, height: 24, mr: 1.5 }} />
                              <Typography variant="body2">
                                {option.studentCode} - {option.fullName}
                              </Typography>
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Sinh viên"
                                fullWidth
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                      <>
                                        {studentSearchLoading ? <CircularProgress color="inherit" size={16} /> : null}
                                        {params.InputProps.endAdornment}
                                      </>
                                  ),
                                }}
                            />
                        )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                          value={filterDecision}
                          label="Trạng thái"
                          onChange={(e) => setFilterDecision(e.target.value)}
                      >
                        <MenuItem value="">Tất cả</MenuItem>
                        <MenuItem value="GRANTED">Thành công</MenuItem>
                        <MenuItem value="DENIED">Từ chối</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        size="small"
                        fullWidth
                        type="datetime-local"
                        label="Từ thời điểm"
                        InputLabelProps={{ shrink: true }}
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        size="small"
                        fullWidth
                        type="datetime-local"
                        label="Đến thời điểm"
                        InputLabelProps={{ shrink: true }}
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleClearSearch}
                      disabled={loading}
                      sx={{ borderRadius: 1.5, textTransform: 'none' }}
                  >
                    Đặt lại
                  </Button>
                  <Button
                      variant="contained"
                      onClick={handleSearchClick}
                      disabled={loading}
                      disableElevation
                      sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                  >
                    Tìm kiếm
                  </Button>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
                {loading ? (
                    <Box p={3}>
                      <CustomSkeleton type="table" count={5} />
                    </Box>
                ) : (
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Thời gian</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Mã sinh viên</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Cổng</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Phương thức</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Ảnh xác thực</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Kết quả</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Ghi chú / Lý do</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {history.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                  <Typography color="text.secondary" variant="body2">
                                    Chưa có dữ liệu nhật ký ra vào.
                                  </Typography>
                                </TableCell>
                              </TableRow>
                          ) : (
                              history.map((row) => (
                                  <TableRow key={row.id} hover>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                      {new Date(row.eventTimestamp).toLocaleString('vi-VN')}
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        {row.studentId === '00000000-0000-0000-0000-000000000000'
                                            ? 'Hệ thống'
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
                                                    ? 'info'
                                                    : 'default'
                                          }
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      {row.snapshotUrl ? (
                                          <IconButton
                                              onClick={() => {
                                                setCurrentSnapshot(row.snapshotUrl || '');
                                                setSnapshotViewerOpen(true);
                                              }}
                                              size="small"
                                          >
                                            <Avatar src={row.snapshotUrl} sx={{ width: 30, height: 30 }}>
                                              <PhotoCameraIcon fontSize="small" />
                                            </Avatar>
                                          </IconButton>
                                      ) : (
                                          <Typography variant="caption" color="text.disabled">
                                            Không có
                                          </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                          label={row.decision === 'GRANTED' ? 'Thành công' : 'Từ chối'}
                                          color={row.decision === 'GRANTED' ? 'success' : 'error'}
                                          size="small"
                                          sx={{ fontWeight: 600 }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {row.denialReason ? (
                                          <Typography variant="body2" color="error.main">
                                            {DENIAL_REASONS_MAP[row.denialReason] || row.denialReason}
                                          </Typography>
                                      ) : (
                                          '-'
                                      )}
                                    </TableCell>
                                  </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                      <TablePagination
                          component="div"
                          count={totalElements || 0}
                          page={page}
                          onPageChange={(_, newPage) => setPage(newPage)}
                          rowsPerPage={rowsPerPage}
                          onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                          }}
                          labelRowsPerPage="Số dòng mỗi trang:"
                      />
                    </TableContainer>
                )}
              </Paper>
            </>
        )}

        {/* TAB 1: Yêu cầu vào trễ */}
        {activeTab === 1 && isAdmin && (
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderBottom: 1, borderColor: 'divider' }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Trạng thái yêu cầu</InputLabel>
                  <Select
                      value={curfewFilterStatus}
                      label="Trạng thái yêu cầu"
                      onChange={(e) => {
                        setCurfewFilterStatus(e.target.value);
                        setPage(0);
                      }}
                  >
                    <MenuItem value="ALL">Tất cả</MenuItem>
                    <MenuItem value="PENDING">Chờ duyệt</MenuItem>
                    <MenuItem value="APPROVED">Đã duyệt</MenuItem>
                    <MenuItem value="REJECTED">Đã từ chối</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {loading ? (
                  <Box p={3}>
                    <CustomSkeleton type="table" count={5} />
                  </Box>
              ) : (
                  <>
                    {selectedCurfewRequestIds.length > 0 && (
                        <Box sx={{ p: 2, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                            Đã chọn {selectedCurfewRequestIds.length} yêu cầu
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                disableElevation
                                onClick={async () => {
                                  await handleBulkUpdateCurfewRequests(selectedCurfewRequestIds, 'APPROVED');
                                  setSelectedCurfewRequestIds([]);
                                }}
                                sx={{ textTransform: 'none', borderRadius: 1.5 }}
                            >
                              Duyệt đã chọn
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={async () => {
                                  await handleBulkUpdateCurfewRequests(selectedCurfewRequestIds, 'REJECTED');
                                  setSelectedCurfewRequestIds([]);
                                }}
                                sx={{ textTransform: 'none', borderRadius: 1.5 }}
                            >
                              Từ chối đã chọn
                            </Button>
                          </Stack>
                        </Box>
                    )}
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                          <TableRow>
                            <TableCell padding="checkbox">
                              <Checkbox
                                  color="primary"
                                  indeterminate={
                                      selectedCurfewRequestIds.length > 0 &&
                                      selectedCurfewRequestIds.length < curfewRequests.filter((r) => r.status === 'PENDING').length
                                  }
                                  checked={
                                      curfewRequests.filter((r) => r.status === 'PENDING').length > 0 &&
                                      selectedCurfewRequestIds.length === curfewRequests.filter((r) => r.status === 'PENDING').length
                                  }
                                  onChange={handleSelectAllCurfewRequests}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Thời gian gửi</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Sinh viên</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Thời gian về dự kiến</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Lý do</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {curfewRequests.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                  <Typography color="text.secondary" variant="body2">
                                    Không có yêu cầu xin vào trễ nào.
                                  </Typography>
                                </TableCell>
                              </TableRow>
                          ) : (
                              curfewRequests.map((row) => {
                                const isItemSelected = selectedCurfewRequestIds.indexOf(row.requestId) !== -1;
                                const isPending = row.status === 'PENDING';

                                return (
                                    <TableRow key={row.requestId} hover selected={isItemSelected}>
                                      <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            checked={isItemSelected}
                                            disabled={!isPending}
                                            onChange={(event) => handleSelectCurfewRequest(event, row.requestId)}
                                        />
                                      </TableCell>
                                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        {new Date(row.createdAt).toLocaleString('vi-VN')}
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {row.studentName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {row.studentCode}
                                        </Typography>
                                      </TableCell>
                                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        {row.expectedArrivalTime
                                            ? new Date(row.expectedArrivalTime).toLocaleString('vi-VN')
                                            : 'Chưa rõ'}
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2" noWrap title={row.reason} sx={{ maxWidth: 200 }}>
                                          {row.reason}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                            label={
                                              row.status === 'APPROVED'
                                                  ? 'Đã duyệt'
                                                  : row.status === 'REJECTED'
                                                      ? 'Đã từ chối'
                                                      : 'Chờ duyệt'
                                            }
                                            color={
                                              row.status === 'APPROVED'
                                                  ? 'success'
                                                  : row.status === 'REJECTED'
                                                      ? 'error'
                                                      : 'warning'
                                            }
                                            size="small"
                                        />
                                      </TableCell>
                                      <TableCell align="center">
                                        {row.status === 'PENDING' && (
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                              <Button
                                                  variant="contained"
                                                  color="success"
                                                  size="small"
                                                  disableElevation
                                                  onClick={() => handleUpdateCurfewRequest(row.requestId, 'APPROVED')}
                                                  sx={{ textTransform: 'none', borderRadius: 1 }}
                                              >
                                                Duyệt
                                              </Button>
                                              <Button
                                                  variant="outlined"
                                                  color="error"
                                                  size="small"
                                                  onClick={() => handleUpdateCurfewRequest(row.requestId, 'REJECTED')}
                                                  sx={{ textTransform: 'none', borderRadius: 1 }}
                                              >
                                                Từ chối
                                              </Button>
                                            </Stack>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                );
                              })
                          )}
                        </TableBody>
                      </Table>
                      <TablePagination
                          component="div"
                          count={totalCurfewRequests || 0}
                          page={page}
                          onPageChange={(_, newPage) => setPage(newPage)}
                          rowsPerPage={rowsPerPage}
                          onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                          }}
                          labelRowsPerPage="Số dòng mỗi trang:"
                      />
                    </TableContainer>
                  </>
              )}
            </Paper>
        )}

        {/* TAB 2: Danh sách vắng mặt */}
        {activeTab === 2 && (
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
              {loadingOutside ? (
                  <Box p={3}>
                    <CustomSkeleton type="table" count={5} />
                  </Box>
              ) : (
                  <Box>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                      <Button
                          variant="outlined"
                          color="inherit"
                          size="small"
                          onClick={() => {
                            const headers = ['Mã sinh viên', 'Tên sinh viên', 'Tòa nhà', 'Phòng', 'Thời gian ra ngoài', 'Trạng thái phép'];
                            const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
                                + headers.join(',') + '\n'
                                + outsideStudents.map(s => {
                                  return `${s.studentCode},"${s.studentName}",${s.buildingName || ''},${s.roomCode || ''},${s.lastOutTime ? new Date(s.lastOutTime).toLocaleString('vi-VN') : ''},${s.hasApprovedRequest ? 'Có phép' : 'Không phép'}`;
                                }).join('\n');
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `danh_sach_vang_mat_${new Date().toISOString().split('T')[0]}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          sx={{ textTransform: 'none', borderRadius: 1.5 }}
                      >
                        Xuất tập tin CSV
                      </Button>
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Tòa nhà</InputLabel>
                        <Select
                            value={filterOutsideBuildingName}
                            label="Tòa nhà"
                            onChange={(e) => setFilterOutsideBuildingName(e.target.value)}
                        >
                          <MenuItem value="">Tất cả tòa nhà</MenuItem>
                          {Array.from(new Set(outsideStudents.map(s => s.buildingName).filter(Boolean))).map((bName) => (
                              <MenuItem key={bName} value={bName}>{bName}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Sinh viên</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Phòng</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Tòa nhà</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Thời gian ra ngoài gần nhất</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Trạng thái phép</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {outsideStudents
                              .filter((student) => !filterOutsideBuildingName || student.buildingName === filterOutsideBuildingName)
                              .length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                  <Typography color="text.secondary" variant="body2">
                                    Không có sinh viên nào đang vắng mặt.
                                  </Typography>
                                </TableCell>
                              </TableRow>
                          ) : (
                              outsideStudents
                                  .filter((student) => !filterOutsideBuildingName || student.buildingName === filterOutsideBuildingName)
                                  .map((row) => (
                                      <TableRow key={row.studentId} hover>
                                        <TableCell>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {row.studentName}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {row.studentCode}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Chip label={row.roomCode || 'Chưa xếp'} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">{row.buildingName || '-'}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          <Typography variant="body2" color="error.main">
                                            {row.lastOutTime ? new Date(row.lastOutTime).toLocaleString('vi-VN') : 'Chưa có thông tin'}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          {row.hasApprovedRequest ? (
                                              <Chip label="Có phép" color="success" size="small" />
                                          ) : (
                                              <Chip label="Chưa xin phép" color="error" size="small" />
                                          )}
                                        </TableCell>
                                      </TableRow>
                                  ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
              )}
            </Paper>
        )}

        {/* DIALOG: Mở cổng từ xa */}
        <Dialog
            open={unlockDialogOpen}
            onClose={() => setUnlockDialogOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Mở cổng từ xa</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Chọn cổng cần mở trực tiếp từ bảng điều khiển.
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Tòa nhà</InputLabel>
              <Select
                  value={buildingId}
                  label="Tòa nhà"
                  onChange={(e) => setBuildingId(e.target.value)}
              >
                <MenuItem value="">Vui lòng chọn tòa nhà</MenuItem>
                {buildings.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
                size="small"
                options={filteredGates}
                getOptionLabel={(option) => option.name || 'Cổng chưa đặt tên'}
                value={selectedGate}
                onChange={(_, newValue) => {
                  setSelectedGate(newValue);
                  setGateId(newValue?.gateId || '');
                }}
                disabled={!buildingId}
                renderInput={(params) => <TextField {...params} label="Cổng kiểm soát" fullWidth sx={{ mb: 2 }} />}
            />

            <Autocomplete
                size="small"
                options={studentOptions}
                getOptionLabel={(option) => `${option.studentCode} - ${option.fullName}`}
                value={selectedStudent}
                onInputChange={(_, newInputValue) => fetchStudents(newInputValue)}
                onChange={(_, newValue) => {
                  setSelectedStudent(newValue);
                  setTargetStudentId(newValue?.studentId || '');
                }}
                isOptionEqualToValue={(option, value) => option.studentId === value.studentId}
                renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.studentId}>
                      <Avatar src={option.avatarUrl} sx={{ width: 26, height: 26, mr: 1.5 }} />
                      <Typography variant="body2">
                        <strong>{option.studentCode}</strong> - {option.fullName}
                      </Typography>
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Ghi nhận cho sinh viên (tùy chọn)"
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                              <>
                                {studentSearchLoading ? <CircularProgress color="inherit" size={16} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                          ),
                        }}
                    />
                )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setUnlockDialogOpen(false)} color="inherit" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
              Hủy bỏ
            </Button>
            <Button
                onClick={onRemoteUnlockSubmit}
                variant="contained"
                disabled={!gateId.trim()}
                disableElevation
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Mở cổng
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG: Xem ảnh xác thực */}
        <Dialog
            open={snapshotViewerOpen}
            onClose={() => setSnapshotViewerOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Ảnh ghi nhận từ camera</DialogTitle>
          <DialogContent dividers sx={{ textAlign: 'center', py: 2 }}>
            {currentSnapshot ? (
                <img
                    src={currentSnapshot}
                    alt="Ảnh đối chứng"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '50vh',
                      borderRadius: '6px',
                      objectFit: 'contain',
                    }}
                />
            ) : (
                <Typography variant="body2" color="text.secondary">
                  Không tìm thấy hình ảnh.
                </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={() => setSnapshotViewerOpen(false)} variant="outlined" color="inherit" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG: Lệnh khẩn cấp */}
        <Dialog
            open={emergencyDialogOpen}
            onClose={() => setEmergencyDialogOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, color: 'error.main' }}>
            Phát lệnh khẩn cấp
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Lệnh này sẽ thay đổi trạng thái khóa/mở của toàn bộ cửa trong phạm vi được lựa chọn.
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Phạm vi áp dụng</InputLabel>
              <Select
                  value={targetBuilding}
                  label="Phạm vi áp dụng"
                  onChange={(e) => setTargetBuilding(e.target.value)}
              >
                <MenuItem value="ALL">Toàn bộ ký túc xá</MenuItem>
                {buildings.map((b) => (
                    <MenuItem key={b.buildingId} value={b.buildingId}>
                      Tòa nhà: {b.name}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Thao tác</InputLabel>
              <Select
                  value={actionType}
                  label="Thao tác"
                  onChange={(e) => setActionType(e.target.value)}
              >
                <MenuItem value="GLOBAL_LOCKDOWN" sx={{ color: 'error.main', fontWeight: 600 }}>
                  Khóa tất cả cửa
                </MenuItem>
                <MenuItem value="GLOBAL_UNLOCK" sx={{ color: 'success.main', fontWeight: 600 }}>
                  Mở tất cả cửa
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
                label="Lý do thực hiện (bắt buộc)"
                fullWidth
                multiline
                rows={2}
                size="small"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                sx={{ mb: 2 }}
            />

            <Box sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <FormControlLabel
                  control={
                    <Checkbox
                        checked={confirmEmergency}
                        onChange={(e) => setConfirmEmergency(e.target.checked)}
                        color="error"
                        size="small"
                    />
                  }
                  label={
                    <Typography variant="caption" color="text.primary">
                      Tôi xác nhận phát lệnh này
                    </Typography>
                  }
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
            <Button onClick={() => setEmergencyDialogOpen(false)} color="inherit" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
              Hủy bỏ
            </Button>
            <Button
                onClick={onEmergencySubmit}
                variant="contained"
                color="error"
                disableElevation
                disabled={!reason.trim() || !confirmEmergency}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Thực hiện
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG: Đồng bộ trạng thái IN/OUT */}
        <Dialog
            open={syncDialogOpen}
            onClose={() => setSyncDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
            Cập nhật trạng thái ra/vào
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sử dụng khi sinh viên bị lệch trạng thái hiển thị (ví dụ: đi cùng người khác mà không quẹt thẻ).
            </Typography>

            <Autocomplete
                options={syncStudentOptions}
                loading={syncStudentLoading}
                value={syncStudent}
                getOptionLabel={(o) => `${o.fullName} (${o.studentCode})`}
                onInputChange={(_, val) => {
                  setSyncStudentQuery(val);
                  fetchSyncStudents(val);
                }}
                onChange={(_, val) => {
                  setSyncStudent(val);
                  setSyncStudentId(val?.studentId || '');
                }}
                isOptionEqualToValue={(o, v) => o.studentId === v.studentId}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Tìm sinh viên"
                        size="small"
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                              <>
                                {syncStudentLoading && <CircularProgress size={16} />}
                                {params.InputProps.endAdornment}
                              </>
                          ),
                        }}
                    />
                )}
                sx={{ mb: 2 }}
                noOptionsText={syncStudentQuery ? 'Không tìm thấy sinh viên' : 'Nhập mã hoặc tên sinh viên'}
            />

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Trạng thái cập nhật</InputLabel>
              <Select
                  value={syncDirection}
                  label="Trạng thái cập nhật"
                  onChange={(e) => setSyncDirection(e.target.value as 'IN' | 'OUT')}
              >
                <MenuItem value="IN">Đang ở trong KTX (IN)</MenuItem>
                <MenuItem value="OUT">Đang ở ngoài KTX (OUT)</MenuItem>
              </Select>
            </FormControl>

            <TextField
                fullWidth
                label="Lý do cập nhật"
                placeholder="Ví dụ: Sinh viên chưa quẹt thẻ khi vào cổng"
                multiline
                rows={2}
                size="small"
                value={syncReason}
                onChange={(e) => setSyncReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
            <Button onClick={() => setSyncDialogOpen(false)} color="inherit" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
              Hủy bỏ
            </Button>
            <Button
                onClick={async () => {
                  if (!syncStudentId) return;
                  await handleSyncState(syncStudentId, syncDirection, syncReason || undefined);
                  setSyncDialogOpen(false);
                  if (activeTab === 2) fetchOutsideStudents();
                }}
                variant="contained"
                color="warning"
                disableElevation
                disabled={!syncStudentId}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Lưu thay đổi
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}