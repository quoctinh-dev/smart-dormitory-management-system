// src/pages/admin/RoomManagement/components/RoomCard.tsx
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';
import React, { useState } from 'react';

import type { RoomWithBeds, BedResponse } from '@/types/room';

import BedIcon from './BedIcon';
import RoomActionMenu from './RoomActionMenu';

export interface RoomCardProps {
  room: RoomWithBeds;
  onBedClick: (bed: BedResponse, room: RoomWithBeds) => void;
  onChangeStatus: (roomId: string, status: string) => void;
  onEditRoom: (room: RoomWithBeds) => void;
  onRefresh: () => void;
}

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  AVAILABLE: 'success',
  FULL: 'error',
  MAINTENANCE: 'warning',
  CLOSED: 'default',
};

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: 'Còn chỗ',
  FULL: 'Đã đầy',
  MAINTENANCE: 'Bảo trì',
  CLOSED: 'Đã đóng',
};

export default function RoomCard({
                                   room,
                                   onBedClick,
                                   onChangeStatus,
                                   onEditRoom,
                                   onRefresh,
                                 }: RoomCardProps) {
  const [showPin, setShowPin] = useState(false);

  const occupancyPercent =
      room.capacity > 0 ? Math.round((room.occupiedBeds / room.capacity) * 100) : 0;
  const isFull = occupancyPercent >= 100;
  const hasSeats = occupancyPercent < 100;

  return (
      <Card
          variant="outlined"
          sx={{
            height: '100%',
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            },
          }}
      >
        <CardContent sx={{ p: 2.5 }}>
          {/* ── Header ─────────────────────────────────── */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Phòng {room.roomCode}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tầng {room.floorNumber} · {room.buildingCode}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                  PIN: {room.roomPinCode ? (showPin ? room.roomPinCode : '******') : 'Chưa có'}
                </Typography>
                {room.roomPinCode && (
                    <IconButton
                        size="small"
                        onClick={() => setShowPin(!showPin)}
                        sx={{ p: 0.25, color: 'primary.main' }}
                    >
                      {showPin ? (
                          <VisibilityOff sx={{ fontSize: 14 }} />
                      ) : (
                          <Visibility sx={{ fontSize: 14 }} />
                      )}
                    </IconButton>
                )}
              </Stack>
            </Box>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Chip
                  label={STATUS_LABEL[room.status] ?? room.status}
                  color={STATUS_COLOR[room.status] ?? 'default'}
                  size="small"
                  sx={{ fontWeight: 600, borderRadius: 1 }}
              />
              <RoomActionMenu
                  roomId={room.roomId}
                  roomStatus={room.status}
                  bedsCount={room.beds?.length ?? 0}
                  capacity={room.capacity}
                  onChangeStatus={onChangeStatus}
                  onEditRoom={() => onEditRoom(room)}
                  onRefresh={onRefresh}
              />
            </Stack>
          </Stack>

          {/* ── Occupancy bar ───────────────────────────── */}
          <Box mb={2}>
            <Stack direction="row" justifyContent="space-between" mb={0.75}>
              <Typography variant="caption" color="text.secondary">
                Lấp đầy
              </Typography>
              <Typography variant="caption" fontWeight={700} fontFamily="monospace">
                {room.occupiedBeds}/{room.capacity} ({occupancyPercent}%)
              </Typography>
            </Stack>
            <Box
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: (theme) => alpha(theme.palette.divider, 0.8),
                  overflow: 'hidden',
                }}
            >
              <Box
                  sx={{
                    height: '100%',
                    width: `${occupancyPercent}%`,
                    borderRadius: 3,
                    bgcolor: isFull ? 'error.main' : hasSeats ? 'success.main' : 'warning.main',
                    transition: 'width 0.4s ease',
                  }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
              {isFull
                  ? 'Phòng đã đầy, không còn chỗ.'
                  : `Còn ${room.capacity - room.occupiedBeds} giường trống.`}
            </Typography>
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* ── Bed grid ────────────────────────────────── */}
          <Box sx={{ pt: 2 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.25 }}>
              <BedOutlinedIcon fontSize="small" color="action" />
              <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
              >
                Sơ đồ giường ({room.beds?.length ?? 0})
              </Typography>
            </Stack>
            <Grid container spacing={1}>
              {(room.beds ?? []).map((bed) => (
                  <Grid key={bed.bedId}>
                    <BedIcon bed={bed} onClick={(b) => onBedClick(b, room)} />
                  </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>
  );
}