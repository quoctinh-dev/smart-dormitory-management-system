import BoltIcon from '@mui/icons-material/Bolt';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  Typography,
  Paper,
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
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  InputAdornment,
  Chip,
  Stack,
} from '@mui/material';
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

  const unitLabel = utilityType === 'ELECTRICITY' ? 'kWh' : 'm³';

  return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Dynamic Header */}
        <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
              mb: 3,
            }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Ghi chỉ số điện
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cập nhật và chốt chỉ số tiêu thụ điện hàng tháng theo từng phòng.
            </Typography>
          </Box>

          <Button
              variant="outlined"
              color="inherit"
              startIcon={<RefreshIcon />}
              onClick={fetchRooms}
              disabled={loading}
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
          >
            Làm mới dữ liệu
          </Button>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
              value={utilityType}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
          >
            <Tab
                icon={<BoltIcon fontSize="small" />}
                iconPosition="start"
                label="Chốt chỉ số điện"
                value="ELECTRICITY"
                sx={{ fontWeight: 600, textTransform: 'none' }}
            />
          </Tabs>
        </Box>

        {/* Filter Section */}
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Bộ lọc khu vực và thời gian
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tòa nhà</InputLabel>
                <Select
                    value={selectedBuildingId}
                    label="Tòa nhà"
                    onChange={(e) => setSelectedBuildingId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Tất cả tòa nhà</em>
                  </MenuItem>
                  {buildings.map((b) => (
                      <MenuItem key={b.buildingId} value={b.buildingId}>
                        {b.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tầng</InputLabel>
                <Select
                    value={selectedFloorId}
                    label="Tầng"
                    onChange={(e) => setSelectedFloorId(e.target.value)}
                    disabled={!selectedBuildingId}
                >
                  <MenuItem value="">
                    <em>Tất cả các tầng</em>
                  </MenuItem>
                  {floors.map((f) => (
                      <MenuItem key={f.floorId} value={f.floorId}>
                        Tầng {f.floorNumber}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
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

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Năm</InputLabel>
                <Select
                    value={year}
                    label="Năm"
                    onChange={(e) => setYear(Number(e.target.value))}
                >
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
          </Grid>
        </Paper>

        {/* Main Table */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                <TableRow>
                  <TableCell width="15%" sx={{ fontWeight: 600 }}>Phòng</TableCell>
                  <TableCell width="25%" sx={{ fontWeight: 600 }}>
                    Chỉ số đầu kỳ ({unitLabel})
                  </TableCell>
                  <TableCell width="25%" sx={{ fontWeight: 600 }}>
                    Chỉ số cuối kỳ ({unitLabel})
                  </TableCell>
                  <TableCell width="15%" sx={{ fontWeight: 600 }}>
                    Tiêu thụ
                  </TableCell>
                  <TableCell width="10%" sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  <TableCell width="10%" align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && rooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                ) : rooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary" variant="body2">
                          Không tìm thấy danh sách phòng phù hợp.
                        </Typography>
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
                          <TableRow key={room.roomId} hover>
                            <TableCell sx={{ fontWeight: 600 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {room.roomCode}
                                </Typography>
                                {room.isFirstRecord && (
                                    <Chip label="Ghi lần đầu" size="small" color="info" variant="outlined" sx={{ width: 'fit-content', height: 20, fontSize: '0.65rem' }} />
                                )}
                              </Stack>
                            </TableCell>

                            <TableCell>
                              {room.isFirstRecord ? (
                                  <TextField
                                      type="number"
                                      size="small"
                                      fullWidth
                                      placeholder="Chỉ số ban đầu"
                                      value={oldReadings[room.roomId] !== undefined ? oldReadings[room.roomId] : ''}
                                      onChange={(e) => handleOldReadingChange(room.roomId, e.target.value)}
                                      disabled={room.isSettled}
                                      error={oldReadings[room.roomId] === undefined || oldReadings[room.roomId] === ''}
                                      InputProps={{
                                        endAdornment: <InputAdornment position="end">{unitLabel}</InputAdornment>,
                                      }}
                                  />
                              ) : (
                                  <Tooltip title="Chỉ số này tự động kế thừa từ số cuối kỳ tháng trước" placement="top">
                                    <TextField
                                        size="small"
                                        fullWidth
                                        disabled
                                        value={actualOldReading}
                                        InputProps={{
                                          startAdornment: (
                                              <InputAdornment position="start">
                                                <LockIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                                              </InputAdornment>
                                          ),
                                          endAdornment: <InputAdornment position="end">{unitLabel}</InputAdornment>,
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
                                  placeholder="Nhập số cuối kỳ"
                                  value={newReading !== undefined ? newReading : ''}
                                  onChange={(e) => handleReadingChange(room.roomId, e.target.value)}
                                  disabled={room.isSettled}
                                  error={isError || newReading === ''}
                                  helperText={isError ? `Phải lớn hơn hoặc bằng ${actualOldReading}` : ''}
                                  InputProps={{
                                    endAdornment: <InputAdornment position="end">{unitLabel}</InputAdornment>,
                                  }}
                              />
                            </TableCell>

                            <TableCell>
                              {newReading !== undefined && newReading !== '' && Number(newReading) >= actualOldReading ? (
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    {Number(newReading) - actualOldReading} {unitLabel}
                                  </Typography>
                              ) : (
                                  <Typography variant="body2" color="text.disabled">-</Typography>
                              )}
                            </TableCell>

                            <TableCell>
                              <Chip
                                  label={room.isSettled ? 'Đã chốt' : 'Chưa chốt'}
                                  color={room.isSettled ? 'success' : 'warning'}
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                              />
                            </TableCell>

                            <TableCell align="center">
                              {room.isSettled ? (
                                  <Button
                                      variant="outlined"
                                      color="error"
                                      size="small"
                                      startIcon={<CancelIcon />}
                                      onClick={() => handleCancel(room)}
                                      sx={{ borderRadius: 1.5, textTransform: 'none' }}
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
                                      disableElevation
                                      sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                                  >
                                    Lưu lại
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
        </Paper>
      </Box>
  );
}