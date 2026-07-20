import { Search, FilterList, CheckCircle, PendingActions } from '@mui/icons-material';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';

import { useCheckInManagement } from '@/hooks/useCheckInManagement';

export default function CheckInManagement() {
  const {
    data,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalElements,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    fetchList,
    handleManualCheckIn,
  } = useCheckInManagement();

  const handleSearch = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      setPage(0);
      fetchList();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Quản lý & báo cáo nhận phòng
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
          Bảng đối soát danh sách sinh viên đã và đang chờ nhận phòng. Thao tác thực thi chính nên
          dùng qua App Mobile.
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          borderColor: 'divider',
          boxShadow: '0 8px 32px rgba(0,0,0,0.02)',
        }}
      >
        {/* THANH CÔNG CỤ LỌC */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <TextField
            size="small"
            placeholder="Tìm theo MSSV, Tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            sx={{ width: 300, bgcolor: 'background.paper', borderRadius: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'background.paper' }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filterStatus}
              label="Trạng thái"
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(0);
              }}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="PENDING_CHECKIN">Chưa nhận phòng (Chờ)</MenuItem>
              <MenuItem value="OCCUPIED">Đã nhận phòng (Đang ở)</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<FilterList />}
            onClick={() => {
              setPage(0);
              fetchList();
            }}
            sx={{ borderRadius: 2, boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)' }}
          >
            Lọc dữ liệu
          </Button>
        </Box>

        {/* BẢNG DỮ LIỆU */}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Sinh viên</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>MSSV</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Vị trí phòng</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Giờ nhận phòng</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  Thao tác (Dự phòng)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Không có dữ liệu đối soát phù hợp. (Cần Backend API)
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.assignmentId} hover>
                    <TableCell>{row.student?.fullName}</TableCell>
                    <TableCell>{row.student?.studentCode}</TableCell>
                    <TableCell>
                      {row.buildingName} - P.{row.roomCode} - G.{row.bedCode}
                    </TableCell>
                    <TableCell>
                      {row.status === 'OCCUPIED' ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Đã nhận phòng"
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<PendingActions />}
                          label="Chờ nhận phòng"
                          color="warning"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {row.checkInAt ? new Date(row.checkInAt).toLocaleString('vi-VN') : '--'}
                    </TableCell>
                    <TableCell align="right">
                      {row.status === 'PENDING_CHECKIN' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleManualCheckIn(row.assignmentId)}
                        >
                          Check-in tay
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      </Paper>
    </Box>
  );
}
