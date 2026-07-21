// src/pages/admin/RoomManagement/DashboardView.tsx
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import { Box, Stack, Typography, Paper, alpha } from '@mui/material';
import Grid from '@mui/material/Grid2';
import React, { useState } from 'react';

import type { RoomWithBeds, BedResponse } from '@/types/room';

import BedDetailDrawer from './components/BedDetailDrawer';
import RoomCard from './components/RoomCard';
import UpdateRoomDialog from './components/UpdateRoomDialog';
import MaintenanceRelocationDialog from './components/MaintenanceRelocationDialog';

export interface DashboardViewProps {
    roomsWithBeds: RoomWithBeds[];
    onRefresh: () => void;
}

export default function DashboardView({ roomsWithBeds, onRefresh }: DashboardViewProps) {
    const [selectedBed, setSelectedBed] = useState<BedResponse | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<RoomWithBeds | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // State for Update Room
    const [editRoomOpen, setEditRoomOpen] = useState(false);
    const [roomToEdit, setRoomToEdit] = useState<RoomWithBeds | null>(null);

    // State for Emergency Relocation
    const [relocationDialogOpen, setRelocationDialogOpen] = useState(false);
    const [roomToRelocate, setRoomToRelocate] = useState<RoomWithBeds | null>(null);

    if (!roomsWithBeds || roomsWithBeds.length === 0) {
        return (
            <Paper
                variant="outlined"
                sx={{
                    p: { xs: 4, md: 6 },
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                }}
            >
                <Stack spacing={1.5} alignItems="center">
                    <HomeWorkOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Chưa có dữ liệu phòng
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Vui lòng chọn Tòa nhà và Tầng ở bộ lọc phía trên để xem danh sách phòng.
                    </Typography>
                </Stack>
            </Paper>
        );
    }

    const handleBedClick = (bed: BedResponse, room: RoomWithBeds) => {
        setSelectedBed(bed);
        setSelectedRoom(room);
        setDrawerOpen(true);
    };

    const handleEditRoom = (room: RoomWithBeds) => {
        setRoomToEdit(room);
        setEditRoomOpen(true);
    };

    const handleChangeStatus = async (roomId: string, status: string) => {
        if (status === 'MAINTENANCE') {
            const room = roomsWithBeds.find((r) => r.roomId === roomId);
            if (room) {
                // Check for ANY active assignment (RESERVED or OCCUPIED) to match backend validation
                const hasActiveBeds = room.beds.some(b => b.status === 'OCCUPIED' || b.status === 'RESERVED');

                if (hasActiveBeds) {
                    setRoomToRelocate(room);
                    setRelocationDialogOpen(true);
                    return;
                }
            }
        }

        const { default: roomApi } = await import('@/api/room-api');
        const { snackbar } = await import('@/helpers/snackbar');

        try {
            await roomApi.patchRoomStatus(roomId, status as any);
            snackbar.success('Cập nhật trạng thái phòng thành công');
            onRefresh();
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Không thể thay đổi trạng thái phòng';
            snackbar.error(msg);
        }
    };

    return (
        <>
            <Grid container spacing={3}>
                {roomsWithBeds.map((room) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={room.roomId}>
                        <RoomCard
                            room={room}
                            onBedClick={handleBedClick}
                            onChangeStatus={handleChangeStatus}
                            onEditRoom={handleEditRoom}
                            onRefresh={onRefresh}
                        />
                    </Grid>
                ))}
            </Grid>

            <BedDetailDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                bed={selectedBed}
                room={selectedRoom}
                onRefresh={onRefresh}
            />

            <UpdateRoomDialog
                open={editRoomOpen}
                onClose={() => setEditRoomOpen(false)}
                room={roomToEdit}
                onSuccess={() => {
                    setEditRoomOpen(false);
                    onRefresh();
                }}
            />

            <MaintenanceRelocationDialog
                open={relocationDialogOpen}
                onClose={() => setRelocationDialogOpen(false)}
                room={roomToRelocate}
                onSuccess={() => {
                    setRelocationDialogOpen(false);
                    onRefresh();
                }}
            />
        </>
    );
}