// src/pages/admin/RoomManagement/RoomManagementPage.tsx
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
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
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import React, { useState } from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useRoomDashboard } from '@/hooks/useRoomDashboard';

import BuildingFormDialog from './components/BuildingFormDialog';
import CreateRoomDialog from './components/CreateRoomDialog';
import FloorFormDialog from './components/FloorFormDialog';
import DashboardView from './DashboardView';

export default function RoomManagementPage() {
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

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
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
          <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700 }}>
            Quản lý Phòng Ký túc xá
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
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
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        <Chip label={`Tổng phòng: ${totalRooms}`} color="primary" variant="outlined" />
        <Chip label={`Còn trống: ${availableRooms}`} color="success" variant="outlined" />
        <Chip
          label={`Đang dùng: ${occupiedBeds}/${totalCapacity}`}
          color="info"
          variant="outlined"
        />
        <Chip label={`Tỷ lệ sử dụng: ${occupancyRate}%`} color="secondary" variant="outlined" />
      </Box>


      {/* ── Thanh lọc Cascade + Nút Thêm phòng ─────── */}
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', lg: 'center' }}
        sx={{
          mb: 4,
          bgcolor: 'background.paper',
          p: { xs: 2.25, md: 3 },
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="building-label">Chọn Tòa nhà</InputLabel>
              <Select
                labelId="building-label"
                value={selectedBuilding}
                label="Chọn Tòa nhà"
                onChange={(e) => setSelectedBuilding(e.target.value)}
              >
                {buildings.map((b) => (
                  <MenuItem key={b.buildingId} value={b.buildingId}>
                    [{b.code}] {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Thêm tòa nhà mới">
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setIsEditBuilding(false);
                  setBuildingFormOpen(true);
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sửa thông tin tòa nhà này">
              <IconButton
                size="small"
                color="info"
                disabled={!selectedBuilding}
                onClick={() => {
                  setIsEditBuilding(true);
                  setBuildingFormOpen(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <FormControl fullWidth size="small" disabled={!selectedBuilding}>
              <InputLabel id="floor-label">Chọn Tầng</InputLabel>
              <Select
                labelId="floor-label"
                value={selectedFloor}
                label="Chọn Tầng"
                onChange={(e) => setSelectedFloor(e.target.value)}
              >
                {floors.map((f) => (
                  <MenuItem key={f.floorId} value={f.floorId}>
                    Tầng {f.floorNumber}
                    {f.gender ? ` (${f.gender})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Thêm tầng mới vào tòa này">
              <IconButton
                size="small"
                color="primary"
                disabled={!selectedBuilding}
                onClick={() => {
                  setIsEditFloor(false);
                  setFloorFormOpen(true);
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sửa thông tin tầng này">
              <IconButton
                size="small"
                color="info"
                disabled={!selectedFloor}
                onClick={() => {
                  setIsEditFloor(true);
                  setFloorFormOpen(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={async () => {
              if (
                !window.confirm(
                  'Hệ thống sẽ tự động tạo mã PIN cho TẤT CẢ các phòng hiện chưa có PIN. Bạn có chắc chắn không?'
                )
              )
                return;
              try {
                const { default: roomPinApi } = await import('@/api/roomPinApi');
                const { snackbar } = await import('@/utils/snackbar');
                const res = await roomPinApi.bulkGeneratePins();
                snackbar.success(`Đã tạo thành công PIN cho ${res.generatedCount} phòng.`);
                refresh();
              } catch (err: unknown) {
                const { snackbar } = await import('@/utils/snackbar');
                const { getErrorMessage } = await import('@/types/api');
                snackbar.error(getErrorMessage(err, 'Lỗi khi tạo PIN hàng loạt'));
              }
            }}
            sx={{ whiteSpace: 'nowrap', borderRadius: '12px', textTransform: 'none', px: 2 }}
          >
            Tạo PIN hàng loạt
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!selectedFloor}
            sx={{ whiteSpace: 'nowrap', borderRadius: '12px', textTransform: 'none', px: 3 }}
            onClick={() => setCreateRoomOpen(true)}
          >
            Thêm Phòng
          </Button>
        </Box>
      </Stack>

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
