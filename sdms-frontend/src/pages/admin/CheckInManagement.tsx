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
  Stack,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import checkInApi from '@/api/checkInApi';
import { snackbar } from '@/utils/snackbar';

// Định dạng DTO giả định cho danh sách trả về từ Backend
interface HousingAssignmentDto {
  assignmentId: string;
  status: string; // 'PENDING_CHECKIN' | 'OCCUPIED'
  checkInAt?: string;
  student: {
    studentCode: string;
    fullName: string;
    cccd?: string;
  };
  buildingName: string;
  roomCode: string;
  bedCode: string;
}

export default function CheckInManagement() {
  const [data, setData] = useState<HousingAssignmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL | PENDING_CHECKIN | OCCUPIED

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await checkInApi.getList({
        page,
        size: rowsPerPage,
        search: searchQuery,
        status: filterStatus === 'ALL' ? undefined : filterStatus,
      });
      // Giả sử API bọc list trong res.content và tổng số trong res.totalElements
      if (res && res.content) {
        setData(res.content);
        setTotalElements(res.totalElements || res.content.length);
      } else if (Array.isArray(res)) {
        setData(res);
        setTotalElements(res.length);
      } else if (res && res.data && res.data.content) {
         setData(res.data.content);
         setTotalElements(res.data.totalElements || res.data.content.length);
      } else {
        // Fallback mock nếu API chưa sẵn sàng
        setData([]);
      }
    } catch (err) {
      console.error(err);
      snackbar.error('Không thể tải danh sách kiểm soát Check-in. Backend cần implement API GET /v1/admin/housing-assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filterStatus]);

  const handleSearch = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      setPage(0);
      fetchList();
    }
  };

  // Nút Check-in thủ công (Dự phòng cho App)
  const handleManualCheckIn = async (assignmentId: string) => {
    try {
      await checkInApi.confirmCheckIn(assignmentId);
      snackbar.success('Check-in thủ công thành công!');
      fetchList(); // Reload table
    } catch (err: any) {
      snackbar.error(err?.response?.data?.message || 'Check-in thất bại');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Quản Lý & Báo Cáo Nhận Phòng
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
          Bảng đối soát danh sách sinh viên đã và đang chờ nhận phòng. Thao tác thực thi chính nên dùng qua App Mobile.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
        {/* THANH CÔNG CỤ LỌC */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Tìm theo MSSV, Tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            sx={{ width: 300, bgcolor: 'background.paper' }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }
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
            >
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="PENDING_CHECKIN">Chưa nhận phòng (Chờ)</MenuItem>
              <MenuItem value="OCCUPIED">Đã nhận phòng (Đang ở)</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" startIcon={<FilterList />} onClick={() => { setPage(0); fetchList(); }}>
            Lọc Dữ Liệu
          </Button>
        </Box>

        {/* BẢNG DỮ LIỆU */}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><b>Sinh viên</b></TableCell>
                <TableCell><b>MSSV</b></TableCell>
                <TableCell><b>Vị trí phòng</b></TableCell>
                <TableCell><b>Trạng thái</b></TableCell>
                <TableCell><b>Giờ nhận phòng</b></TableCell>
                <TableCell align="right"><b>Thao tác (Dự phòng)</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && data.length === 0 ? (
                 <TableRow><TableCell colSpan={6} align="center">Đang tải dữ liệu...</TableCell></TableRow>
              ) : data.length === 0 ? (
                 <TableRow><TableCell colSpan={6} align="center">Không có dữ liệu đối soát phù hợp. (Cần Backend API)</TableCell></TableRow>
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
                        <Chip icon={<CheckCircle />} label="Đã nhận phòng" color="success" size="small" />
                      ) : (
                        <Chip icon={<PendingActions />} label="Chờ nhận phòng" color="warning" size="small" />
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
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      </Paper>
    </Box>
  );
}
