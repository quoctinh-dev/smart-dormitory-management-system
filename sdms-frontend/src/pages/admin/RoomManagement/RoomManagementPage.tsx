// src/pages/admin/RoomManagement/RoomManagementPage.jsx
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2'; // Sử dụng Grid hệ mới thế hệ v5 tối ưu hiệu năng
import React from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useRoomDashboard } from '@/hooks/useRoomDashboard';

import DashboardView from './DashboardView';

export default function RoomManagementPage() {
  const {
    buildings,
    floors,
    roomsWithBeds,
    selectedBuilding,
    setSelectedBuilding,
    selectedFloor,
    setSelectedFloor,
    loading,
  } = useRoomDashboard();

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Tiêu đề Phân hệ */}
      <Typography variant="h4" sx={{ mb: 4, color: 'text.primary', fontWeight: 700 }}>
        Quản lý Giường Phòng Ký túc xá
      </Typography>

      {/* Thanh công cụ lọc dạng Cascade Filter (Tòa nhà -> Tầng) */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 4,
          bgcolor: 'background.paper',
          p: 3,
          borderRadius: '24px', // Bo tròn theo ngôn ngữ thiết kế hệ thống
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Dropdown 1: Lọc theo Tòa nhà */}
        <FormControl fullWidth size="small">
          <InputLabel id="building-filter-label">Chọn Tòa nhà</InputLabel>
          <Select
            labelId="building-filter-label"
            // 🌟 GIẢI PHÁP: Ép kiểu String để tránh xung đột dữ liệu làm đơ ô Chọn
            value={selectedBuilding ? String(selectedBuilding) : ''}
            label="Chọn Tòa nhà"
            onChange={(e) => {
              console.log('🔥 Đã chọn Tòa nhà! Giá trị ID phát đi:', e.target.value);
              setSelectedBuilding(e.target.value);
            }}
          >
            {buildings.map((building, index) => {
              // Phòng hờ các tên thuộc tính ID khác nhau từ API (id, buildingId, _id)
              const bId = building.id || building.buildingId || building._id;
              return (
                <MenuItem key={bId || `building-${index}`} value={String(bId)}>
                  {building.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {/* Dropdown 2: Lọc theo Tầng (Bị disabled tự động khi chưa có tòa nhà) */}
        <FormControl fullWidth size="small" disabled={!selectedBuilding}>
          <InputLabel id="floor-filter-label">Chọn Tầng</InputLabel>
          <Select
            labelId="floor-filter-label"
            // 🌟 GIẢI PHÁP: Ép kiểu String đồng bộ tương tự tòa nhà
            value={selectedFloor ? String(selectedFloor) : ''}
            label="Chọn Tầng"
            onChange={(e) => {
              console.log('🔥 Đã chọn Tầng! Giá trị ID phát đi:', e.target.value);
              setSelectedFloor(e.target.value);
            }}
          >
            {floors.map((floor, index) => {
              // Phòng hờ các tên thuộc tính ID khác nhau từ API (id, floorId, _id)
              const fId = floor.id || floor.floorId || floor._id;
              return (
                <MenuItem key={fId || `floor-${index}`} value={String(fId)}>
                  Tầng {floor.floorNumber || floor.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Stack>

      {/* Điều phối hiển thị dựa theo trạng thái tải dữ liệu */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
              <CustomSkeleton type="dashboard" count={1} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <DashboardView roomsWithBeds={roomsWithBeds} />
      )}
    </Box>
  );
}
