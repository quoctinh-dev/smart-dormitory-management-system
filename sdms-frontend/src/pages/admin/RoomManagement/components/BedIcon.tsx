// src/pages/admin/RoomManagement/components/BedIcon.tsx
import HotelIcon from '@mui/icons-material/Hotel';
import { Box, Tooltip } from '@mui/material';
import React from 'react';

import type { BedResponse, BedStatus } from '@/types/room';

export interface BedIconProps {
    bed: BedResponse;
    onClick?: (bed: BedResponse) => void;
}

const BED_BG: Record<BedStatus, string> = {
    AVAILABLE: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', // Premium Emerald
    RESERVED: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',  // Premium Pink (Hồng)
    OCCUPIED: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)',  // Premium Soft Red
    MAINTENANCE: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)',// Premium Yellow (Vàng)
};

const BED_SHADOW: Record<BedStatus, string> = {
    AVAILABLE: 'rgba(46, 204, 113, 0.4)',
    RESERVED: 'rgba(255, 117, 140, 0.4)', // Pink shadow
    OCCUPIED: 'rgba(214, 48, 49, 0.4)',
    MAINTENANCE: 'rgba(241, 196, 15, 0.4)', // Yellow shadow
};

const BED_LABELS: Record<BedStatus, string> = {
    AVAILABLE: 'Trống',
    RESERVED: 'Đã giữ chỗ',
    OCCUPIED: 'Đang ở',
    MAINTENANCE: 'Bảo trì',
};

export default function BedIcon({ bed, onClick }: BedIconProps) {
    const bgGradient = BED_BG[bed.status] ?? '#94a3b8';
    const shadowColor = BED_SHADOW[bed.status] ?? 'rgba(0,0,0,0.1)';
    const label = BED_LABELS[bed.status] ?? bed.status;

    return (
        <Tooltip title={`Giường ${bed.bedCode} — ${label}`} arrow placement="top">
            <Box
                onClick={() => onClick?.(bed)}
                sx={{
                    p: 1.2,
                    borderRadius: 2, // Bo góc mềm mại hơn
                    background: bgGradient,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 4px 10px ${shadowColor}`,
                    border: '1px solid rgba(255,255,255,0.2)', // Hiệu ứng kính (glassmorphism) nhẹ
                    '&:hover': { 
                        transform: 'translateY(-3px) scale(1.05)',
                        boxShadow: `0 8px 16px ${shadowColor}`
                    },
                    '&:active': {
                        transform: 'translateY(0) scale(0.95)'
                    }
                }}
            >
                <HotelIcon fontSize="small" />
            </Box>
        </Tooltip>
    );
}