import React, { useState } from 'react';
import BoltIcon from '@mui/icons-material/Bolt';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import CheckIcon from '@mui/icons-material/Check';
import UndoIcon from '@mui/icons-material/Undo';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TablePagination,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

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
    historyModalOpen,
    historyRoomCode,
    roomHistory,
    historyLoading,
    openHistoryModal,
    closeHistoryModal,
  } = useUtilityReading();

  // Quản lý phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const unitLabel = utilityType === 'ELECTRICITY' ? 'kWh' : 'm³';

  // Lấy danh sách phòng hiển thị theo trang
  const displayedRooms = rooms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header trang */}
        <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
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

        {/* Điều hướng loại chỉ số */}
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

        {/* Thanh bộ lọc */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tòa nhà</InputLabel>
                <Select
                    value={selectedBuildingId}
                    label="Tòa nhà"
                    onChange={(e) => {
                      setSelectedBuildingId(e.target.value);
                      setPage(0);
                    }}
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
                    onChange={(e) => {
                      setSelectedFloorId(e.target.value);
                      setPage(0);
                    }}
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
                    onChange={(e) => {
                      setMonth(Number(e.target.value));
                      setPage(0);
                    }}
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
                    onChange={(e) => {
                      setYear(Number(e.target.value));
                      setPage(0);
                    }}
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

        {/* Bảng danh sách phòng & ghi chỉ số */}
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
                    displayedRooms.map((room) => {
                      const isFirstRecord = room.isFirstRecord ?? (room as any).firstRecord;
                      const actualOldReading = isFirstRecord
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
                          (!isFirstRecord || (oldReadings[room.roomId] !== undefined && oldReadings[room.roomId] !== ''));

                      return (
                          <TableRow key={room.roomId} hover>
                            <TableCell sx={{ fontWeight: 600 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {room.roomCode}
                                </Typography>
                                {isFirstRecord && (
                                    <Chip
                                        label="Ghi lần đầu"
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                        sx={{ width: 'fit-content', height: 20, fontSize: '0.65rem' }}
                                    />
                                )}
                              </Stack>
                            </TableCell>

                            <TableCell>
                              {isFirstRecord ? (
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
                                  <Tooltip title="Tự động kế thừa từ số cuối kỳ tháng trước" placement="top" arrow>
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
                                  helperText={isError ? `Phải ≥ ${actualOldReading}` : ''}
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
                                  color={room.isSettled ? 'success' : 'default'}
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                              />
                            </TableCell>

                            <TableCell align="center">
                              <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                                {room.isSettled ? (
                                    <Tooltip title="Hủy chốt số điện" arrow placement="top">
                                      <IconButton
                                          color="error"
                                          size="small"
                                          onClick={() => handleCancel(room)}
                                          sx={{
                                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                            '&:hover': { bgcolor: (theme) => alpha(theme.palette.error.main, 0.2) },
                                          }}
                                      >
                                        <UndoIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                ) : (
                                    <Tooltip title={isValid ? 'Lưu lại chỉ số' : 'Vui lòng nhập chỉ số hợp lệ'} arrow placement="top">
                              <span>
                                <IconButton
                                    color="primary"
                                    size="small"
                                    disabled={!isValid}
                                    onClick={() => handleSave(room)}
                                    sx={{
                                      bgcolor: isValid
                                          ? (theme) => alpha(theme.palette.primary.main, 0.1)
                                          : 'action.disabledBackground',
                                      '&:hover': {
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                                      },
                                    }}
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </span>
                                    </Tooltip>
                                )}

                                <Tooltip title="Lịch sử 24 tháng gần nhất" arrow placement="top">
                                  <IconButton
                                      color="info"
                                      size="small"
                                      onClick={() => openHistoryModal(room.roomId, room.roomCode)}
                                      sx={{
                                        bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                                        '&:hover': { bgcolor: (theme) => alpha(theme.palette.info.main, 0.2) },
                                      }}
                                  >
                                    <HistoryIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Thêm Phân trang đồng bộ */}
          <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={rooms.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Số dòng mỗi trang:"
          />
        </Paper>

        {/* Dialog Lịch sử ghi chỉ số */}
        <Dialog open={historyModalOpen} onClose={closeHistoryModal} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Lịch sử {utilityType === 'ELECTRICITY' ? 'điện' : 'nước'} - Phòng {historyRoomCode}
            </Typography>
            <IconButton onClick={closeHistoryModal} size="small"><CancelIcon /></IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            {historyLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress size={28} />
                </Box>
            ) : roomHistory.length === 0 ? (
                <Typography align="center" color="text.secondary" p={4} variant="body2">
                  Chưa có lịch sử ghi chép nào.
                </Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Tháng/Năm</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Ngày ghi</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Số đầu kỳ</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Số cuối kỳ</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tiêu thụ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {roomHistory.map((item) => (
                          <TableRow key={item.utilityUsageId} hover>
                            <TableCell>{item.month}/{item.year}</TableCell>
                            <TableCell>{item.readingDate || 'N/A'}</TableCell>
                            <TableCell>{item.oldReading} {unitLabel}</TableCell>
                            <TableCell>{item.newReading} {unitLabel}</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {item.totalUsage} {unitLabel}
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeHistoryModal} color="inherit" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}