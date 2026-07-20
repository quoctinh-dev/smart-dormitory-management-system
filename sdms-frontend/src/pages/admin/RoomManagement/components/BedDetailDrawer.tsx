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
import React from 'react';

import { useBedDetail } from '@/hooks/useBedDetail';
import type { BedResponse, BedStatus, RoomWithBeds } from '@/types/room';

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
  const { assignment, loading, actionLoading, error, handleChangeBedStatus, handleChangeRoomRole } =
      useBedDetail(open, bed, room, onClose, onRefresh);

  if (!bed || !room) return null;

  const isOccupied = bed.status === 'OCCUPIED' || bed.status === 'RESERVED';

  return (
      <Drawer
          anchor="right"
          open={open}
          onClose={onClose}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
          PaperProps={{
            sx: {
              width: { xs: '100vw', sm: 420 },
              bgcolor: 'background.default',
            },
          }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* ── Header ─────────────────────────────────── */}
          <Box sx={{ p: 3, pb: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.50', color: 'primary.main', display: 'flex' }}>
                  <HotelIcon />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
                    Giường {bed.bedCode}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Phòng {room.roomCode} · Tầng {room.floorNumber} · {room.buildingCode}
                  </Typography>
                </Box>
              </Stack>
              <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* ── Status ─────────────────────────────────── */}
          <Box sx={{ p: 3, pb: 0 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold" textTransform="uppercase" fontSize="0.75rem">
              Trạng thái hiện tại
            </Typography>
            <Chip
                label={BED_STATUS_LABEL[bed.status]}
                color={BED_STATUS_COLOR[bed.status]}
                sx={{ fontWeight: 'bold', borderRadius: 2, px: 1, py: 2.5, width: '100%', fontSize: '0.9rem' }}
            />
          </Box>

          {/* ── Content (Loading / Error / Assignment / Empty) ─── */}
          <Box flex={1} sx={{ p: 3, overflowY: 'auto' }}>
            {loading ? (
                <Stack alignItems="center" justifyContent="center" height={200}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary" mt={2}>
                    Đang tải thông tin sinh viên...
                  </Typography>
                </Stack>
            ) : error ? (
                <Paper sx={{ p: 2, borderColor: 'error.main', bgcolor: 'error.50', borderRadius: 2 }}>
                  <Typography color="error" variant="body2" fontWeight="bold">
                    {error}
                  </Typography>
                </Paper>
            ) : isOccupied && assignment ? (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold" textTransform="uppercase" fontSize="0.75rem">
                    Hồ sơ Sinh viên
                  </Typography>

                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                    {assignment.student ? (
                        <Box display="flex" flexDirection="column" gap={1.5}>
                          {/* Hàng 1: Họ tên */}
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Họ tên
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="text.primary">
                              {assignment.student.fullName}
                            </Typography>
                          </Box>

                          <Divider sx={{ borderStyle: 'dashed' }} />

                          {/* Hàng 2: Mã SV */}
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Mã SV
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="text.primary">
                              {assignment.student.studentCode}
                            </Typography>
                          </Box>

                          <Divider sx={{ borderStyle: 'dashed' }} />

                          {/* Hàng 3: Email */}
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" color="primary.main" sx={{ wordBreak: 'break-all' }}>
                              {assignment.student.email}
                            </Typography>
                          </Box>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic" align="center">
                          Đơn đã được giữ chỗ nhưng chưa liên kết sinh viên (đang chờ thanh toán).
                        </Typography>
                    )}
                  </Paper>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold" textTransform="uppercase" fontSize="0.75rem">
                    Thông tin Hợp đồng
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, mb: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1} textAlign="center">
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Ngày giữ chỗ
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {assignment.reservedAt
                              ? new Date(assignment.reservedAt).toLocaleDateString('vi-VN')
                              : '—'}
                        </Typography>
                      </Box>
                      <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', borderRight: '1px solid' }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Check-in
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {assignment.checkInAt
                              ? new Date(assignment.checkInAt).toLocaleDateString('vi-VN')
                              : '—'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Checkout
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {assignment.expectedCheckOutAt
                              ? new Date(assignment.expectedCheckOutAt).toLocaleDateString('vi-VN')
                              : '—'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Stack direction="column" spacing={2} mb={2} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Box display="flex" justifyContent="flex-start">
                      <Chip label={`Hợp đồng: ${assignment.status}`} color="primary" variant="outlined" size="small" sx={{ fontWeight: 'bold', borderRadius: 1.5 }} />
                    </Box>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Chức vụ trong phòng</InputLabel>
                      <Select
                          value={assignment.roomRole || 'MEMBER'}
                          label="Chức vụ trong phòng"
                          onChange={(e) => handleChangeRoomRole(e.target.value)}
                          disabled={actionLoading}
                          sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="ROOM_LEADER">Trưởng phòng</MenuItem>
                        <MenuItem value="DEPUTY_LEADER">Phó phòng</MenuItem>
                        <MenuItem value="MEMBER">Thành viên</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Box>
            ) : !isOccupied ? (
                <Stack alignItems="center" justifyContent="center" py={8} spacing={2} sx={{ bgcolor: 'background.paper', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
                  <HotelIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography color="text.secondary" variant="body2" textAlign="center" px={4}>
                    Giường đang trống. Sẵn sàng sắp xếp sinh viên thông qua luồng đăng ký.
                  </Typography>
                </Stack>
            ) : null}
          </Box>

          {/* ── Actions ────────────────────────────────── */}
          <Box sx={{ p: 3, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={1.5}>
              {bed.status === 'AVAILABLE' && (
                  <Button
                      variant="contained"
                      color="warning"
                      startIcon={<BuildIcon />}
                      fullWidth
                      disabled={actionLoading}
                      onClick={() => handleChangeBedStatus('MAINTENANCE')}
                      sx={{ borderRadius: 2, py: 1 }}
                  >
                    Chuyển sang Bảo trì
                  </Button>
              )}
              {bed.status === 'MAINTENANCE' && (
                  <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      disabled={actionLoading}
                      onClick={() => handleChangeBedStatus('AVAILABLE')}
                      sx={{ borderRadius: 2, py: 1 }}
                  >
                    Mở lại (AVAILABLE)
                  </Button>
              )}
              {actionLoading && <CircularProgress size={20} sx={{ alignSelf: 'center' }} />}
            </Stack>
          </Box>
        </Box>
      </Drawer>
  );
}