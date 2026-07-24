import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    Chip,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Tooltip,
    Typography,
    Paper,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import React, { useState } from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useRoomDashboard } from '@/hooks/useRoomDashboard';
import { useAuth } from '@/providers/AuthProvider';
import roomApi from '@/api/room-api';
import DeleteIcon from '@mui/icons-material/Delete';
import { snackbar } from '@/helpers/snackbar';
import { confirmDialog } from '@/helpers/confirm';

import BuildingFormDialog from './components/BuildingFormDialog';
import CreateRoomDialog from './components/CreateRoomDialog';
import FloorFormDialog from './components/FloorFormDialog';
import DashboardView from './DashboardView';

export default function RoomManagementPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [createRoomOpen, setCreateRoomOpen] = useState(false);
    const [buildingFormOpen, setBuildingFormOpen] = useState(false);
    const [floorFormOpen, setFloorFormOpen] = useState(false);
    const [isEditBuilding, setIsEditBuilding] = useState(false);
    const [isEditFloor, setIsEditFloor] = useState(false);

    const {
        buildings,
        floors,
        roomsWithBeds,
        selectedBuilding,
        setSelectedBuilding,
        selectedFloor,
        setSelectedFloor,
        loading,
        refresh,
        handleBulkGeneratePins,
    } = useRoomDashboard();

    const currentBuilding = buildings.find((b) => b.buildingId === selectedBuilding) || null;
    const currentFloor = floors.find((f) => f.floorId === selectedFloor) || null;

    const totalRooms = roomsWithBeds.length;
    const totalCapacity = roomsWithBeds.reduce((sum, room) => sum + (room.capacity || 0), 0);
    const occupiedBeds = roomsWithBeds.reduce((sum, room) => sum + (room.occupiedBeds || 0), 0);
    const availableRooms = roomsWithBeds.filter(
        (room) => (room.capacity || 0) > (room.occupiedBeds || 0)
    ).length;
    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;

    const handleDeleteBuilding = async () => {
        if (!currentBuilding) return;
        const isConfirmed = await confirmDialog({
            title: 'Xóa tòa nhà',
            message: `Bạn có chắc muốn xóa tòa nhà ${currentBuilding.name}? Chỉ được xóa khi chưa có dữ liệu phòng.`
        });
        if (!isConfirmed) return;

        try {
            await roomApi.deleteBuilding(currentBuilding.buildingId);
            snackbar.success('Xóa tòa nhà thành công');
            setSelectedBuilding('');
            refresh();
        } catch (error: any) {
            snackbar.error(error.response?.data?.message || 'Lỗi khi xóa tòa nhà');
        }
    };

    const handleDeleteFloor = async () => {
        if (!currentFloor) return;
        const isConfirmed = await confirmDialog({
            title: 'Xóa tầng',
            message: `Bạn có chắc muốn xóa tầng ${currentFloor.floorNumber}? Chỉ được xóa khi các phòng chưa từng có sinh viên.`
        });
        if (!isConfirmed) return;

        try {
            await roomApi.deleteFloor(currentFloor.floorId);
            snackbar.success('Xóa tầng thành công');
            setSelectedFloor('');
            refresh();
        } catch (error: any) {
            snackbar.error(error.response?.data?.message || 'Lỗi khi xóa tầng');
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* ── Tiêu đề ─────────────────────────────────── */}
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2,
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600, mb: 0.5 }}>
                        Quản lý phòng ký túc xá
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Theo dõi phòng, tầng và trạng thái sử dụng theo từng tòa nhà.
                    </Typography>
                </Box>
                <Chip
                    label={
                        currentBuilding
                            ? `${currentBuilding.name}${currentFloor ? ` • Tầng ${currentFloor.floorNumber}` : ''}`
                            : 'Chọn tòa nhà để bắt đầu'
                    }
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderRadius: 1 }}
                />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                <Chip label={`Tổng phòng: ${totalRooms}`} color="primary" variant="outlined" sx={{ fontWeight: 600, borderRadius: 1 }} />
                <Chip label={`Còn trống: ${availableRooms}`} color="success" variant="outlined" sx={{ fontWeight: 600, borderRadius: 1 }} />
                <Chip
                    label={`Đang dùng: ${occupiedBeds}/${totalCapacity}`}
                    color="info"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderRadius: 1 }}
                />
                <Chip label={`Tỷ lệ sử dụng: ${occupancyRate}%`} color="secondary" variant="outlined" sx={{ fontWeight: 600, borderRadius: 1 }} />
            </Box>

            {/* ── Thanh lọc Cascade + Nút Thêm phòng ─────── */}
            <Paper
                variant="outlined"
                sx={{
                    mb: 4,
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', lg: 'row' },
                    gap: 2,
                    alignItems: { xs: 'stretch', lg: 'center' },
                    bgcolor: 'background.paper',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="building-label">Chọn tòa nhà</InputLabel>
                            <Select
                                labelId="building-label"
                                value={selectedBuilding}
                                label="Chọn tòa nhà"
                                onChange={(e) => setSelectedBuilding(e.target.value)}
                                sx={{ borderRadius: 1.5 }}
                            >
                                {buildings.map((b) => (
                                    <MenuItem key={b.buildingId} value={b.buildingId}>
                                        [{b.code}] {b.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {isAdmin && (
                            <Tooltip title="Thêm tòa nhà mới">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => {
                                        setIsEditBuilding(false);
                                        setBuildingFormOpen(true);
                                    }}
                                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                                >
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {isAdmin && (
                            <Tooltip title="Sửa thông tin tòa nhà này">
                                <IconButton
                                    size="small"
                                    color="info"
                                    disabled={!selectedBuilding}
                                    onClick={() => {
                                        setIsEditBuilding(true);
                                        setBuildingFormOpen(true);
                                    }}
                                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {isAdmin && (
                            <Tooltip title="Xóa tòa nhà này">
                                <IconButton
                                    size="small"
                                    color="error"
                                    disabled={!selectedBuilding}
                                    onClick={handleDeleteBuilding}
                                    sx={{ border: '1px solid', borderColor: 'error.main', borderRadius: 1.5, '&:hover': { bgcolor: 'error.lighter' } }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <FormControl fullWidth size="small" disabled={!selectedBuilding}>
                            <InputLabel id="floor-label">Chọn tầng</InputLabel>
                            <Select
                                labelId="floor-label"
                                value={selectedFloor}
                                label="Chọn tầng"
                                onChange={(e) => setSelectedFloor(e.target.value)}
                                sx={{ borderRadius: 1.5 }}
                            >
                                {floors.map((f) => (
                                    <MenuItem key={f.floorId} value={f.floorId}>
                                        Tầng {f.floorNumber}
                                        {f.gender ? ` (${f.gender})` : ''}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {isAdmin && (
                            <Tooltip title="Thêm tầng mới vào tòa này">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    disabled={!selectedBuilding}
                                    onClick={() => {
                                        setIsEditFloor(false);
                                        setFloorFormOpen(true);
                                    }}
                                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                                >
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {isAdmin && (
                            <Tooltip title="Sửa thông tin tầng này">
                                <IconButton
                                    size="small"
                                    color="info"
                                    disabled={!selectedFloor}
                                    onClick={() => {
                                        setIsEditFloor(true);
                                        setFloorFormOpen(true);
                                    }}
                                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {isAdmin && (
                            <Tooltip title="Xóa tầng này">
                                <IconButton
                                    size="small"
                                    color="error"
                                    disabled={!selectedFloor}
                                    onClick={handleDeleteFloor}
                                    sx={{ border: '1px solid', borderColor: 'error.main', borderRadius: 1.5, '&:hover': { bgcolor: 'error.lighter' } }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {isAdmin && (
                        <>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleBulkGeneratePins}
                                sx={{ whiteSpace: 'nowrap', borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 2 }}
                            >
                                Tạo mã PIN hàng loạt
                            </Button>
                            <Button
                                variant="contained"
                                disableElevation
                                startIcon={<AddIcon fontSize="small" />}
                                disabled={!selectedFloor}
                                sx={{ whiteSpace: 'nowrap', borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 2.5 }}
                                onClick={() => setCreateRoomOpen(true)}
                            >
                                Thêm phòng
                            </Button>
                        </>
                    )}
                </Box>
            </Paper>

            {/* ── Nội dung chính ───────────────────────────── */}
            {loading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
                            <CustomSkeleton type="dashboard" count={1} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <DashboardView roomsWithBeds={roomsWithBeds} onRefresh={refresh} />
            )}

            {/* ── Modals ─────────────────────────── */}
            {selectedFloor && (
                <CreateRoomDialog
                    open={createRoomOpen}
                    onClose={() => setCreateRoomOpen(false)}
                    floorId={selectedFloor}
                    onSuccess={() => {
                        setCreateRoomOpen(false);
                        refresh();
                    }}
                />
            )}

            <BuildingFormDialog
                open={buildingFormOpen}
                onClose={() => setBuildingFormOpen(false)}
                building={isEditBuilding ? currentBuilding : null}
                onSuccess={() => {
                    setBuildingFormOpen(false);
                    refresh();
                }}
            />

            {selectedBuilding && (
                <FloorFormDialog
                    open={floorFormOpen}
                    onClose={() => setFloorFormOpen(false)}
                    buildingId={selectedBuilding}
                    currentBuilding={currentBuilding}
                    floor={isEditFloor ? currentFloor : null}
                    onSuccess={() => {
                        setFloorFormOpen(false);
                        refresh();
                    }}
                />
            )}
        </Box>
    );
}