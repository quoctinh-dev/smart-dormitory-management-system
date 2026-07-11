import React, { useState, useEffect, SyntheticEvent } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { utilityApi, RoomUtilityResponse } from '@/api/utilityApi';
import roomApi from '@/api/roomApi';
import { BuildingResponse, FloorResponse } from '@/types/room';
import SaveIcon from '@mui/icons-material/Save';
import BoltIcon from '@mui/icons-material/Bolt';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

export default function UtilityReadingPage() {
  const { enqueueSnackbar } = useSnackbar();
  const currentDate = new Date();
  
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [utilityType, setUtilityType] = useState<'ELECTRICITY' | 'WATER'>('ELECTRICITY');
  
  // Filters
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<RoomUtilityResponse[]>([]);
  const [readings, setReadings] = useState<Record<string, number>>({});
  const [oldReadings, setOldReadings] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      fetchFloors(selectedBuildingId);
      setSelectedFloorId(''); // Reset floor when building changes
    } else {
      setFloors([]);
      setSelectedFloorId('');
    }
  }, [selectedBuildingId]);

  useEffect(() => {
    fetchRooms();
  }, [month, year, utilityType, selectedBuildingId, selectedFloorId]);

  const fetchBuildings = async () => {
    try {
      const res = await roomApi.getBuildings();
      setBuildings(res);
    } catch (error) {
      enqueueSnackbar('Lỗi tải danh sách tòa nhà', { variant: 'error' });
    }
  };

  const fetchFloors = async (buildingId: string) => {
    try {
      const res = await roomApi.getFloorsByBuilding(buildingId);
      setFloors(res);
    } catch (error) {
      enqueueSnackbar('Lỗi tải danh sách tầng', { variant: 'error' });
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await utilityApi.getRoomsForRecording(
        month, 
        year, 
        utilityType, 
        selectedBuildingId || undefined, 
        selectedFloorId || undefined
      );
      setRooms(res);
      
      const initialReadings: Record<string, number> = {};
      const initialOldReadings: Record<string, number> = {};
      res.forEach((room: RoomUtilityResponse) => {
        if (room.newReading !== null) {
          initialReadings[room.roomId] = room.newReading;
        }
        if (room.isFirstRecord) {
          initialOldReadings[room.roomId] = 0; // Default to 0, user will change
        }
      });
      setReadings(initialReadings);
      setOldReadings(initialOldReadings);
    } catch (error) {
      enqueueSnackbar('Lỗi khi tải danh sách phòng', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: SyntheticEvent, newValue: 'ELECTRICITY' | 'WATER') => {
    setUtilityType(newValue);
  };

  const handleReadingChange = (roomId: string, value: string) => {
    const numValue = parseInt(value, 10);
    setReadings(prev => ({
      ...prev,
      [roomId]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleOldReadingChange = (roomId: string, value: string) => {
    const numValue = parseInt(value, 10);
    setOldReadings(prev => ({
      ...prev,
      [roomId]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleSave = async (room: RoomUtilityResponse) => {
    const newReading = readings[room.roomId];
    const actualOldReading = room.isFirstRecord ? oldReadings[room.roomId] : room.oldReading;
    
    if (newReading === undefined || newReading === null) {
      enqueueSnackbar('Vui lòng nhập chỉ số mới', { variant: 'warning' });
      return;
    }
    
    if (room.isFirstRecord && (actualOldReading === undefined || actualOldReading === null)) {
      enqueueSnackbar('Vui lòng nhập chỉ số cũ cho phòng này (lần đầu ghi)', { variant: 'warning' });
      return;
    }
    
    if (newReading < actualOldReading) {
      enqueueSnackbar(`Chỉ số mới không được nhỏ hơn chỉ số cũ (${actualOldReading})`, { variant: 'error' });
      return;
    }

    const unit = utilityType === 'ELECTRICITY' ? 'kWh' : 'm3';
    if (!window.confirm(`Xác nhận chốt ${newReading - actualOldReading} ${unit} cho phòng ${room.roomCode}?`)) {
      return;
    }

    try {
      setLoading(true);
      await utilityApi.recordUtility(utilityType, {
        roomId: room.roomId,
        month,
        year,
        newReading,
        ...(room.isFirstRecord && { oldReading: actualOldReading })
      });
      enqueueSnackbar('Lưu chỉ số thành công!', { variant: 'success' });
      fetchRooms();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Lỗi khi lưu chỉ số', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
          Chốt Chỉ Số Tiện Ích
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Cập nhật chỉ số đồng hồ điện/nước hàng tháng.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={utilityType} onChange={handleTabChange} aria-label="utility tabs">
          <Tab 
            icon={<BoltIcon />} 
            iconPosition="start" 
            label="Chốt Số Điện" 
            value="ELECTRICITY" 
            sx={{ fontWeight: 'bold' }} 
          />
          <Tab 
            icon={<WaterDropIcon />} 
            iconPosition="start" 
            label="Chốt Số Nước" 
            value="WATER" 
            sx={{ fontWeight: 'bold' }} 
          />
        </Tabs>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tòa nhà</InputLabel>
              <Select
                value={selectedBuildingId}
                label="Tòa nhà"
                onChange={(e) => setSelectedBuildingId(e.target.value)}
              >
                <MenuItem value=""><em>Tất cả</em></MenuItem>
                {buildings.map(b => (
                  <MenuItem key={b.buildingId} value={b.buildingId}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tầng</InputLabel>
              <Select
                value={selectedFloorId}
                label="Tầng"
                onChange={(e) => setSelectedFloorId(e.target.value)}
                disabled={!selectedBuildingId}
              >
                <MenuItem value=""><em>Tất cả</em></MenuItem>
                {floors.map(f => (
                  <MenuItem key={f.floorId} value={f.floorId}>Tầng {f.floorNumber}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tháng</InputLabel>
              <Select
                value={month}
                label="Tháng"
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Năm</InputLabel>
              <Select
                value={year}
                label="Năm"
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
                  <MenuItem key={y} value={y}>Năm {y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <Button variant="outlined" onClick={fetchRooms} disabled={loading} fullWidth>
              Làm mới
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="utility reading table">
          <TableHead sx={{ bgcolor: '#fafafa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Mã phòng</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                Chỉ số tháng trước {utilityType === 'ELECTRICITY' ? '(kWh)' : '(m3)'}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Chỉ số mới</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tiêu thụ</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => {
                const actualOldReading = room.isFirstRecord ? (oldReadings[room.roomId] || 0) : room.oldReading;
                const newReading = readings[room.roomId];
                const value = newReading !== undefined ? newReading : '';
                const isError = value !== '' && Number(value) < actualOldReading;
                const isValid = newReading !== undefined && newReading >= actualOldReading && (!room.isFirstRecord || oldReadings[room.roomId] !== undefined);
                
                return (
                  <TableRow
                    key={room.roomId}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, bgcolor: room.isFirstRecord ? 'info.50' : 'inherit' }}
                  >
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      {room.roomCode}
                      {room.isFirstRecord && (
                        <Typography variant="caption" display="block" color="info.main">
                          (Lần đầu ghi)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {room.isFirstRecord ? (
                        <TextField
                          size="small"
                          type="number"
                          value={oldReadings[room.roomId] !== undefined ? oldReadings[room.roomId] : ''}
                          disabled={room.isSettled}
                          onChange={(e) => handleOldReadingChange(room.roomId, e.target.value)}
                          placeholder="Chỉ số đầu kỳ"
                          sx={{ minWidth: 120 }}
                        />
                      ) : (
                        <Typography color="text.secondary">{room.oldReading}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={value}
                        disabled={room.isSettled}
                        onChange={(e) => handleReadingChange(room.roomId, e.target.value)}
                        error={isError}
                        helperText={isError ? "Không hợp lệ" : ""}
                        inputProps={{ min: actualOldReading }}
                        sx={{ minWidth: 150 }}
                      />
                    </TableCell>
                    <TableCell>
                      {newReading !== undefined && newReading >= actualOldReading ? (
                        <Typography fontWeight="bold" color="primary">
                          {newReading - actualOldReading}
                        </Typography>
                      ) : (
                        <Typography>-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          bgcolor: room.isSettled ? 'success.light' : 'warning.light',
                          color: room.isSettled ? 'success.dark' : 'warning.dark',
                        }}
                      >
                        {room.isSettled ? 'Đã chốt' : 'Chưa chốt'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<SaveIcon />}
                        disabled={room.isSettled || !isValid}
                        onClick={() => handleSave(room)}
                      >
                        Lưu
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
