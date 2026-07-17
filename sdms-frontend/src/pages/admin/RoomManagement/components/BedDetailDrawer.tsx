// src/pages/admin/RoomManagement/components/BedDetailDrawer.tsx
import BuildIcon from '@mui/icons-material/Build';
import CloseIcon from '@mui/icons-material/Close';
import HotelIcon from '@mui/icons-material/Hotel';
import PersonIcon from '@mui/icons-material/Person';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import roomApi from '@/api/roomApi';
import type { ActiveAssignmentResponse, BedResponse, BedStatus, RoomWithBeds } from '@/types/room';

export interface BedDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  bed: BedResponse | null;
  room: RoomWithBeds | null;
  onRefresh: () => void;
}

const BED_STATUS_COLOR: Record<BedStatus, 'success' | 'warning' | 'error' | 'default'> = {
  AVAILABLE: 'success',
  RESERVED: 'warning',
  OCCUPIED: 'error',
  MAINTENANCE: 'default',
};

const BED_STATUS_LABEL: Record<BedStatus, string> = {
  AVAILABLE: 'Trống',
  RESERVED: 'Đã giữ chỗ (chưa check-in)',
  OCCUPIED: 'Đang có sinh viên ở',
  MAINTENANCE: 'Đang bảo trì',
};

export default function BedDetailDrawer({
  open,
  onClose,
  bed,
  room,
  onRefresh,
}: BedDetailDrawerProps) {
  const [assignment, setAssignment] = useState<ActiveAssignmentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Khi mở Drawer và giường đang OCCUPIED hoặc RESERVED → gọi API thật
  useEffect(() => {
    if (!open || !bed) return;
    if (bed.status !== 'OCCUPIED' && bed.status !== 'RESERVED') {
      setAssignment(null);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await roomApi.getActiveAssignmentByBed(bed.bedId);
        const data = (res as any)?.data ?? res;
        setAssignment(data as ActiveAssignmentResponse);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Không thể tải thông tin sinh viên.');
        setAssignment(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [open, bed]);

  const handleChangeBedStatus = async (status: BedStatus) => {
    if (!bed) return;
    setActionLoading(true);
    try {
      await roomApi.patchBedStatus(bed.bedId, status);
      onClose();
      onRefresh();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Không thể thay đổi trạng thái giường.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRoomRole = async (newRole: string) => {
    if (!assignment) return;
    setActionLoading(true);
    try {
      await roomApi.assignRoomRole(assignment.assignmentId, newRole);
      setAssignment((prev) => (prev ? { ...prev, roomRole: newRole } : null));
      onRefresh(); // Refresh parent if needed
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Không thể thay đổi chức vụ.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!bed || !room) return null;

  const isOccupied = bed.status === 'OCCUPIED' || bed.status === 'RESERVED';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', sm: 420 } } }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* ── Header ─────────────────────────────────── */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <HotelIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Giường {bed.bedCode}
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Typography variant="caption" color="text.secondary" mb={2}>
          Phòng {room.roomCode} · Tầng {room.floorNumber} · {room.buildingCode}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* ── Status ─────────────────────────────────── */}
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Trạng thái hiện tại
          </Typography>
          <Chip
            label={BED_STATUS_LABEL[bed.status]}
            color={BED_STATUS_COLOR[bed.status]}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* ── Content (Loading / Error / Assignment / Empty) ─── */}
        <Box flex={1}>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" height={200}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" mt={2}>
                Đang tải thông tin sinh viên...
              </Typography>
            </Stack>
          ) : error ? (
            <Paper variant="outlined" sx={{ p: 2, borderColor: 'error.main', bgcolor: 'error.50' }}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Paper>
          ) : isOccupied && assignment ? (
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <PersonIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Hồ sơ Sinh viên
                </Typography>
              </Stack>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                {assignment.student ? (
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Họ tên
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {assignment.student.fullName}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Mã SV
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {assignment.student.studentCode}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body2">{assignment.student.email}</Typography>
                    </Stack>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Đơn đã được giữ chỗ nhưng chưa liên kết sinh viên (đang chờ thanh toán).
                  </Typography>
                )}
              </Paper>

              <Stack spacing={1.5} direction="row" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Ngày giữ chỗ
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {assignment.reservedAt
                      ? new Date(assignment.reservedAt).toLocaleDateString('vi-VN')
                      : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Check-in
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {assignment.checkInAt
                      ? new Date(assignment.checkInAt).toLocaleDateString('vi-VN')
                      : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Dự kiến checkout
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {assignment.expectedCheckOutAt
                      ? new Date(assignment.expectedCheckOutAt).toLocaleDateString('vi-VN')
                      : '—'}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Chip label={`Hợp đồng: ${assignment.status}`} variant="outlined" size="small" />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Chức vụ trong phòng</InputLabel>
                  <Select
                    value={assignment.roomRole || 'MEMBER'}
                    label="Chức vụ trong phòng"
                    onChange={(e) => handleChangeRoomRole(e.target.value)}
                    disabled={actionLoading}
                  >
                    <MenuItem value="ROOM_LEADER">Trưởng phòng</MenuItem>
                    <MenuItem value="DEPUTY_LEADER">Phó phòng</MenuItem>
                    <MenuItem value="MEMBER">Thành viên</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          ) : !isOccupied ? (
            <Stack alignItems="center" justifyContent="center" py={5} spacing={2}>
              <Typography color="text.secondary" variant="body2">
                Giường đang trống. Sẵn sàng sắp xếp sinh viên thông qua luồng đăng ký.
              </Typography>
            </Stack>
          ) : null}
        </Box>

        {/* ── Actions ────────────────────────────────── */}
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.5}>
          {bed.status === 'AVAILABLE' && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<BuildIcon />}
              fullWidth
              disabled={actionLoading}
              onClick={() => handleChangeBedStatus('MAINTENANCE')}
            >
              Chuyển sang Bảo trì
            </Button>
          )}
          {bed.status === 'MAINTENANCE' && (
            <Button
              variant="outlined"
              color="success"
              fullWidth
              disabled={actionLoading}
              onClick={() => handleChangeBedStatus('AVAILABLE')}
            >
              Mở lại (AVAILABLE)
            </Button>
          )}
          {actionLoading && <CircularProgress size={20} sx={{ alignSelf: 'center' }} />}
        </Stack>
      </Box>
    </Drawer>
  );
}
