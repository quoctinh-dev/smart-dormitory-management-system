import BuildIcon from '@mui/icons-material/Build';
import CloseIcon from '@mui/icons-material/Close';
import HotelIcon from '@mui/icons-material/Hotel';
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
import { alpha } from '@mui/material/styles';
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
          <Box sx={{ p: 2.5, pb: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08), color: 'primary.main', display: 'flex' }}>
                  <HotelIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                    Giường {bed.bedCode}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Phòng {room.roomCode} · Tầng {room.floorNumber} · {room.buildingCode}
                  </Typography>
                </Box>
              </Stack>
              <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* ── Status ─────────────────────────────────── */}
          <Box sx={{ p: 2.5, pb: 0 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={700} textTransform="uppercase" display="block" sx={{ mb: 1 }}>
              Trạng thái hiện tại
            </Typography>
            <Chip
                label={BED_STATUS_LABEL[bed.status]}
                color={BED_STATUS_COLOR[bed.status]}
                size="small"
                sx={{ fontWeight: 600, borderRadius: 1, px: 1, py: 2, width: '100%', justifyContent: 'center' }}
            />
          </Box>

          {/* ── Content (Loading / Error / Assignment / Empty) ─── */}
          <Box flex={1} sx={{ p: 2.5, overflowY: 'auto' }}>
            {loading ? (
                <Stack alignItems="center" justifyContent="center" height={200} spacing={1.5}>
                  <CircularProgress size={28} />
                  <Typography variant="body2" color="text.secondary">
                    Đang tải thông tin sinh viên...
                  </Typography>
                </Stack>
            ) : error ? (
                <Paper variant="outlined" sx={{ p: 2, borderColor: 'error.main', bgcolor: (theme) => alpha(theme.palette.error.main, 0.05), borderRadius: 2 }}>
                  <Typography color="error" variant="body2" fontWeight={600}>
                    {error}
                  </Typography>
                </Paper>
            ) : isOccupied && assignment ? (
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={700} textTransform="uppercase" display="block" sx={{ mb: 1 }}>
                    Hồ sơ Sinh viên
                  </Typography>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2.5, bgcolor: 'background.paper' }}>
                    {assignment.student ? (
                        <Stack spacing={1.5}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Họ tên
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="text.primary">
                              {assignment.student.fullName}
                            </Typography>
                          </Box>

                          <Divider sx={{ borderStyle: 'dashed' }} />

                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Mã SV
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="text.primary" fontFamily="monospace">
                              {assignment.student.studentCode}
                            </Typography>
                          </Box>

                          <Divider sx={{ borderStyle: 'dashed' }} />

                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="primary.main" sx={{ wordBreak: 'break-all' }}>
                              {assignment.student.email}
                            </Typography>
                          </Box>
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic" align="center" sx={{ py: 1 }}>
                          Đơn đã được giữ chỗ nhưng chưa liên kết sinh viên (đang chờ thanh toán).
                        </Typography>
                    )}
                  </Paper>

                  <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={700} textTransform="uppercase" display="block" sx={{ mb: 1 }}>
                    Thông tin Hợp đồng
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2.5, bgcolor: 'background.paper' }}>
                    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1} textAlign="center">
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Ngày giữ chỗ
                        </Typography>
                        <Typography variant="body2" fontWeight={700} fontFamily="monospace">
                          {assignment.reservedAt
                              ? new Date(assignment.reservedAt).toLocaleDateString('vi-VN')
                              : '—'}
                        </Typography>
                      </Box>
                      <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', borderRight: '1px solid' }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Check-in
                        </Typography>
                        <Typography variant="body2" fontWeight={700} fontFamily="monospace">
                          {assignment.checkInAt
                              ? new Date(assignment.checkInAt).toLocaleDateString('vi-VN')
                              : '—'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Checkout
                        </Typography>
                        <Typography variant="body2" fontWeight={700} fontFamily="monospace">
                          {assignment.expectedCheckOutAt
                              ? new Date(assignment.expectedCheckOutAt).toLocaleDateString('vi-VN')
                              : '—'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Stack direction="column" spacing={2} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box display="flex" justifyContent="flex-start">
                      <Chip label={`Hợp đồng: ${assignment.status}`} color="primary" variant="outlined" size="small" sx={{ fontWeight: 600, borderRadius: 1 }} />
                    </Box>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Chức vụ trong phòng</InputLabel>
                      <Select
                          value={assignment.roomRole || 'MEMBER'}
                          label="Chức vụ trong phòng"
                          onChange={(e) => handleChangeRoomRole(e.target.value)}
                          disabled={actionLoading}
                          sx={{ borderRadius: 1.5 }}
                      >
                        <MenuItem value="ROOM_LEADER">Trưởng phòng</MenuItem>
                        <MenuItem value="DEPUTY_LEADER">Phó phòng</MenuItem>
                        <MenuItem value="MEMBER">Thành viên</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Box>
            ) : !isOccupied ? (
                <Stack alignItems="center" justifyContent="center" py={6} spacing={2} sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                  <HotelIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                  <Typography color="text.secondary" variant="body2" textAlign="center" px={3}>
                    Giường đang trống. Sẵn sàng sắp xếp sinh viên thông qua luồng đăng ký.
                  </Typography>
                </Stack>
            ) : null}
          </Box>

          {/* ── Actions ────────────────────────────────── */}
          <Box sx={{ p: 2.5, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={1.5}>
              {bed.status === 'AVAILABLE' && (
                  <Button
                      variant="contained"
                      color="warning"
                      disableElevation
                      startIcon={<BuildIcon fontSize="small" />}
                      fullWidth
                      disabled={actionLoading}
                      onClick={() => handleChangeBedStatus('MAINTENANCE')}
                      sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, py: 1 }}
                  >
                    Chuyển sang Bảo trì
                  </Button>
              )}
              {bed.status === 'MAINTENANCE' && (
                  <Button
                      variant="contained"
                      color="success"
                      disableElevation
                      fullWidth
                      disabled={actionLoading}
                      onClick={() => handleChangeBedStatus('AVAILABLE')}
                      sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, py: 1 }}
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