// src/pages/admin/RoomManagement/DashboardView.jsx
import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid2'; // Kế thừa Grid hệ mới của MUI v5 toàn cục
import HotelIcon from '@mui/icons-material/Hotel';

export default function DashboardView({ roomsWithBeds }) {
  
  // Trích xuất mã màu tương thích với hệ thống Palette thiết kế của bạn
  const getBedColor = (status) => {
    switch (status) {
      case 'AVAILABLE': 
        return '#059669'; // Xanh lá cây hệ thống (Secondary Main)
      case 'MAINTENANCE': 
        return '#ed6c02'; // Màu Cam Cảnh báo/Bảo trì
      default: 
        return '#d32f2f'; // Màu Đỏ hệ thống - Đã có sinh viên ở (Occupied)
    }
  };

  // Trường hợp chưa kích hoạt bộ lọc hoặc mảng dữ liệu trống rỗng
  if (!roomsWithBeds || roomsWithBeds.length === 0) {
    return (
      <Box 
        sx={{ 
          p: 5, 
          textAlign: 'center', 
          bgcolor: 'background.paper', 
          borderRadius: '24px', 
          border: '1px solid', 
          borderColor: 'divider' 
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Không có dữ liệu phòng hiển thị. Vui lòng chọn Tòa nhà và Tầng ở bộ lọc phía trên.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {roomsWithBeds.map((room, roomIdx) => {
        const rId = room.id || room.roomId || `room-${roomIdx}`;
        
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={rId}>
            {/* Kế thừa mặc định MuiCard overrides (borderRadius: 24, shadow nhẹ) */}
            <Card 
              sx={{ 
                transition: 'all 0.2s ease-in-out', 
                '&:hover': { 
                  transform: 'translateY(-4px)', 
                  boxShadow: '0 12px 24px rgba(0,0,0,0.08)' 
                } 
              }}
            >
              <CardContent sx={{ p: 3 }}>
                
                {/* Thông tin Header Phòng */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" color="text.primary" fontWeight={700}>
                    Phòng {room.roomNumber || room.name}
                  </Typography>
                  <Box sx={{ bgcolor: 'grey.100', px: 1.5, py: 0.5, borderRadius: '8px' }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                      {room.roomType || 'Tiêu chuẩn'}
                    </Typography>
                  </Box>
                </Stack>

                {/* Trạng thái hoạt động phòng */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Trạng thái phòng: <strong style={{ color: room.status === 'ACTIVE' ? '#2563eb' : '#94a3b8' }}>{room.status}</strong>
                </Typography>

                {/* Lưới sơ đồ phân phối vị trí Giường */}
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                  <Typography 
                    variant="caption" 
                    fontWeight="700" 
                    color="grey.400" 
                    sx={{ display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  >
                    Sơ đồ giường thực tế ({room.beds?.length || 0})
                  </Typography>
                  
                  <Grid container spacing={1}>
                    {room.beds?.map((bed, bedIdx) => {
                      // 🌟 GIẢI PHÁP: Đồng bộ định danh duy nhất cho từng chiếc giường con để sửa lỗi unique key
                      const bId = bed.id || bed.bedId || `bed-${room.id || roomIdx}-${bedIdx}`;
                      
                      return (
                        // 🌟 CHUYỂN KEY LÊN THẺ GRID NGOÀI CÙNG VÒNG LẶP CON
                        <Grid key={bId}>
                          <Tooltip title={`Giường số: ${bed.bedNumber || bedIdx + 1} (${bed.status})`} arrow>
                            <Box
                              sx={{
                                p: 1.2,
                                borderRadius: '12px', // Đồng bộ bo cong 12px của TextField trong hệ thống theme
                                bgcolor: getBedColor(bed.status),
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s',
                                '&:hover': { opacity: 0.85 }
                              }}
                            >
                              <HotelIcon fontSize="small" />
                            </Box>
                          </Tooltip>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>

              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}