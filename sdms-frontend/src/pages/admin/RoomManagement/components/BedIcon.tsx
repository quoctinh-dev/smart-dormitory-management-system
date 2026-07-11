// src/pages/admin/RoomManagement/components/BedIcon.tsx
import HotelIcon from '@mui/icons-material/Hotel';
import { Box, Tooltip } from '@mui/material';
import React from 'react';
import type { BedResponse, BedStatus } from '@/types/room';

export interface BedIconProps {
  bed: BedResponse;
  index: number;
  onClick?: (bed: BedResponse) => void;
}

const BED_COLORS: Record<BedStatus, string> = {
  AVAILABLE:   '#059669', // Xanh lá — Trống
  RESERVED:    '#d97706', // Vàng cam — Đã giữ chỗ (chưa check-in)
  OCCUPIED:    '#d32f2f', // Đỏ — Đang ở
  MAINTENANCE: '#6b7280', // Xám — Bảo trì
};

const BED_LABELS: Record<BedStatus, string> = {
  AVAILABLE:   'Trống',
  RESERVED:    'Đã giữ chỗ',
  OCCUPIED:    'Đang ở',
  MAINTENANCE: 'Bảo trì',
};

export default function BedIcon({ bed, index, onClick }: BedIconProps) {
  const color = BED_COLORS[bed.status] ?? '#94a3b8';
  const label = BED_LABELS[bed.status] ?? bed.status;

  return (
    <Tooltip
      title={`Giường ${bed.bedCode} — ${label}`}
      arrow
      placement="top"
    >
      <Box
        onClick={() => onClick?.(bed)}
        sx={{
          p: 1.2,
          borderRadius: '12px',
          bgcolor: color,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          '&:hover': { opacity: 0.82, transform: 'scale(1.08)' },
          boxShadow: `0 2px 6px ${color}55`,
        }}
      >
        <HotelIcon fontSize="small" />
      </Box>
    </Tooltip>
  );
}
