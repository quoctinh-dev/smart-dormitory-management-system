import BoltIcon from '@mui/icons-material/Bolt';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
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
  Tab,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import InfoIcon from '@mui/icons-material/Info';
import { alpha } from '@mui/material/styles';
import React from 'react';

import { useUtilityReading } from '@/hooks/useUtilityReading';

export default function UtilityReadingPage() {
  const {
    month,
    setMonth,
    year,
    setYear,
    utilityType,
    buildings,
    floors,
    selectedBuildingId,
    setSelectedBuildingId,
    selectedFloorId,
    setSelectedFloorId,
    loading,
    rooms,
    readings,
    oldReadings,
    handleTabChange,
    handleReadingChange,
    handleOldReadingChange,
    handleSave,
    handleCancel,
    fetchRooms,
    currentDate,
  } = useUtilityReading();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
          Chốt chỉ số điện
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Cập nhật chỉ số đồng hồ điện hàng tháng cho các phòng.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'none' }}>
        <Tabs value={utilityType} onChange={handleTabChange} aria-label="utility tabs">
          <Tab
            icon={<BoltIcon />}
            iconPosition="start"
            label="Chốt số điện"
            value="ELECTRICITY"
            sx={{ fontWeight: 'bold' }}
          />
          <Tab
            icon={<WaterDropIcon />}
            iconPosition="start"
            label="Chốt số nước"
            value="WATER"
            sx={{ fontWeight: 'bold' }}
          />
        </Tabs>
      </Box>

      {/* Filters */}
      <Card
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.02)',
          border: '1px solid rgba(255,255,255,0.4)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tòa nhà</InputLabel>
              <Select
                value={selectedBuildingId}
                label="Tòa nhà"
                onChange={(e) => setSelectedBuildingId(e.target.value)}
              >
                <MenuItem value="">
                  <em>Tất cả</em>
                </MenuItem>
                {buildings.map((b) => (
                  <MenuItem key={b.buildingId} value={b.buildingId}>
                    {b.name}
                  </MenuItem>
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
                <MenuItem value="">
                  <em>Tất cả</em>
                </MenuItem>
                {floors.map((f) => (
                  <MenuItem key={f.floorId} value={f.floorId}>
                    Tầng {f.floorNumber}
                  </MenuItem>
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
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <MenuItem key={m} value={m}>
                    Tháng {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Năm</InputLabel>
              <Select value={year} label="Năm" onChange={(e) => setYear(Number(e.target.value))}>
                {[
                  currentDate.getFullYear() - 1,
                  currentDate.getFullYear(),
                  currentDate.getFullYear() + 1,
                ].map((y) => (
                  <MenuItem key={y} value={y}>
                    Năm {y}
                  </MenuItem>
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
      <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
        <Table sx={{ minWidth: 650 }} aria-label="utility reading table">
          <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04) }}>
            <TableRow>
              <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Mã phòng</TableCell>
              <TableCell width="25%" sx={{ fontWeight: 'bold' }}>
                Chỉ số cũ (Kế thừa từ tháng trước) {utilityType === 'ELECTRICITY' ? '(kWh)' : '(m3)'}
              </TableCell>
              <TableCell width="25%" sx={{ fontWeight: 'bold' }}>Chỉ số trên đồng hồ cuối kỳ</TableCell>
              <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Tiêu thụ (Mới - Cũ)</TableCell>
              <TableCell width="10%" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell width="10%" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
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
                const actualOldReading = room.isFirstRecord
                  ? oldReadings[room.roomId] !== undefined && oldReadings[room.roomId] !== ''
                    ? Number(oldReadings[room.roomId])
                    : 0
                  : room.oldReading;
                const newReading = readings[room.roomId];
                const value = newReading !== undefined ? newReading : '';
                const isError = value !== '' && Number(value) < actualOldReading;
                const isValid =
                  newReading !== undefined &&
                  newReading !== '' &&
                  Number(newReading) >= actualOldReading &&
                  (!room.isFirstRecord || (oldReadings[room.roomId] !== undefined && oldReadings[room.roomId] !== ''));

                return (
                  <TableRow
                    key={room.roomId}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      bgcolor: room.isFirstRecord ? 'info.50' : 'inherit',
                    }}
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
                          type="number"
                          size="small"
                          fullWidth
                          placeholder="Chỉ số đầu tiên"
                          value={oldReadings[room.roomId] !== undefined ? oldReadings[room.roomId] : ''}
                          onChange={(e) => handleOldReadingChange(room.roomId, e.target.value)}
                          disabled={room.isSettled}
                          error={oldReadings[room.roomId] === undefined || oldReadings[room.roomId] === ''}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">{utilityType === 'ELECTRICITY' ? 'kWh' : 'm3'}</InputAdornment>,
                          }}
                        />
                      ) : (
                        <Tooltip title="Chỉ số này được hệ thống tự động kế thừa từ số cuối kỳ của tháng trước để đảm bảo tính minh bạch.">
                          <TextField
                            size="small"
                            fullWidth
                            disabled
                            value={actualOldReading}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockIcon fontSize="small" />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">{utilityType === 'ELECTRICITY' ? 'kWh' : 'm3'}</InputAdornment>
                              ),
                            }}
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        placeholder="Nhập số trên đồng hồ"
                        value={newReading !== undefined ? newReading : ''}
                        onChange={(e) => handleReadingChange(room.roomId, e.target.value)}
                        disabled={room.isSettled}
                        error={isError || newReading === ''}
                        helperText={isError ? `Phải ≥ ${actualOldReading}` : ''}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">{utilityType === 'ELECTRICITY' ? 'kWh' : 'm3'}</InputAdornment>,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {newReading !== undefined && newReading !== '' && Number(newReading) >= actualOldReading ? (
                        <Typography fontWeight="bold" color="primary">
                          {Number(newReading) - actualOldReading}
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
                          borderRadius: 4,
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          bgcolor: room.isSettled ? 'success.light' : 'warning.light',
                          color: room.isSettled ? 'success.dark' : 'warning.dark',
                        }}
                      >
                        {room.isSettled ? 'Đã chốt' : 'Chưa chốt'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {room.isSettled ? (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleCancel(room)}
                        >
                          Hủy chốt
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<SaveIcon />}
                          disabled={!isValid}
                          onClick={() => handleSave(room)}
                        >
                          Lưu
                        </Button>
                      )}
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
