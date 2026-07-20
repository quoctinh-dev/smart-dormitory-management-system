import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TablePagination,
  Container,
  InputAdornment,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import React, { useState, useMemo } from 'react';

import { useChangeRoomManagement } from '@/hooks/useChangeRoomManagement';
import { ChangeRoomRequestStatus } from '@/types/change-room';
import CustomSkeleton from '@/components/common/CustomSkeleton';

export default function ChangeRoomManagementPage() {
  const {
    requests,
    loading,
    selectedRequest,
    processDialogOpen,
    setProcessDialogOpen,
    processData,
    setProcessData,
    availableBeds,
    loadingBeds,
    handleProcessOpen,
    handleProcessSubmit,
  } = useChangeRoomManagement();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter states
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Apply filters
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchKeyword = 
        (req.currentRoomName || '').toLowerCase().includes(filterKeyword.toLowerCase()) ||
        (req.targetRoomName || '').toLowerCase().includes(filterKeyword.toLowerCase());
      
      const matchStatus = filterStatus === 'ALL' || req.status === filterStatus;
      
      return matchKeyword && matchStatus;
    });
  }, [requests, filterKeyword, filterStatus]);

  const paginatedRequests = filteredRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderStatus = (status: ChangeRoomRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="Đang chờ" color="warning" size="small" sx={{ fontWeight: 'bold' }} />;
      case 'APPROVED':
        return <Chip label="Đã duyệt" color="success" size="small" sx={{ fontWeight: 'bold' }} />;
      case 'REJECTED':
        return <Chip label="Từ chối" color="error" size="small" sx={{ fontWeight: 'bold' }} />;
      default:
        return <Chip label={status} size="small" sx={{ fontWeight: 'bold' }} />;
    }
  };

  if (loading && requests.length === 0) {
    return (
      <Container sx={{ py: 4 }} maxWidth="lg">
        <CustomSkeleton type="table" />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }} maxWidth="lg">
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            Quản lý Đơn Đổi phòng
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Duyệt đơn xin đổi phòng của sinh viên trong học kỳ hiện tại.
          </Typography>
        </Box>
      </Box>

      {/* Filter Options */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2, color: 'text.secondary' }}>
          <FilterList fontSize="small" />
          <Typography variant="body2" fontWeight="bold">
            Bộ lọc
          </Typography>
        </Box>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Tìm theo phòng hoặc MSSV..."
          value={filterKeyword}
          onChange={(e) => {
            setFilterKeyword(e.target.value);
            setPage(0);
          }}
          sx={{ width: { xs: '100%', sm: 300 }, bgcolor: '#ffffff', borderRadius: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl
          size="small"
          variant="outlined"
          sx={{ width: { xs: '100%', sm: 200 }, bgcolor: '#ffffff', borderRadius: 1 }}
        >
          <InputLabel>Trạng thái</InputLabel>
          <Select
            label="Trạng thái"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
            <MenuItem value="PENDING">Đang chờ</MenuItem>
            <MenuItem value="APPROVED">Đã duyệt</MenuItem>
            <MenuItem value="REJECTED">Từ chối</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Main Grid/Table Wrapper */}
      <TableContainer component={Paper} sx={{ overflow: 'hidden', borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Ngày gửi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phòng hiện tại</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phòng mong muốn</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Lý do</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary', fontStyle: 'italic' }}>
                  Không tìm thấy đơn xin đổi phòng nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRequests.map((req) => (
                <TableRow key={req.id} hover>
                  <TableCell>{new Date(req.createdAt).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>{req.currentRoomName || 'N/A'}</TableCell>
                  <TableCell>{req.targetRoomName || 'Không xác định'}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 250,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {req.reason}
                  </TableCell>
                  <TableCell>{renderStatus(req.status)}</TableCell>
                  <TableCell align="center">
                    {req.status === 'PENDING' && (
                      <Box display="flex" gap={1} justifyContent="center">
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleProcessOpen(req, true)}
                          sx={{ borderRadius: 1.5, textTransform: 'none', px: 2 }}
                        >
                          Duyệt
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleProcessOpen(req, false)}
                          sx={{ borderRadius: 1.5, textTransform: 'none', px: 2 }}
                        >
                          Từ chối
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredRequests.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Số dòng:"
      />

      {/* Dialog xử lý đơn */}
      <Dialog
        open={processDialogOpen}
        onClose={() => setProcessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {processData.isApproved ? 'Duyệt yêu cầu đổi phòng' : 'Từ chối yêu cầu đổi phòng'}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <TextField
              label="Ghi chú của Admin"
              multiline
              rows={3}
              fullWidth
              value={processData.adminNote}
              onChange={(e) => setProcessData({ ...processData, adminNote: e.target.value })}
            />
            {processData.isApproved && selectedRequest?.targetRoomId ? (
              <FormControl fullWidth required disabled={loadingBeds}>
                <InputLabel>Giường mới (Phòng {selectedRequest.targetRoomName})</InputLabel>
                <Select
                  value={processData.newBedId}
                  label={`Giường mới (Phòng ${selectedRequest.targetRoomName})`}
                  onChange={(e) =>
                    setProcessData({ ...processData, newBedId: e.target.value as string })
                  }
                >
                  {availableBeds.length === 0 && !loadingBeds && (
                    <MenuItem value="" disabled>
                      Không có giường trống
                    </MenuItem>
                  )}
                  {availableBeds.map((bed) => (
                    <MenuItem key={bed.bedId} value={bed.bedId}>
                      Giường {bed.bedCode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : processData.isApproved && !selectedRequest?.targetRoomId ? (
              <TextField
                label="ID Giường mới (UUID)"
                fullWidth
                required
                value={processData.newBedId}
                onChange={(e) => setProcessData({ ...processData, newBedId: e.target.value })}
                helperText="Sinh viên không chọn phòng đích. Vui lòng nhập ID giường hoặc cập nhật hệ thống để hỗ trợ chọn phòng."
              />
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 2 }}>
          <Button onClick={() => setProcessDialogOpen(false)} color="inherit">Hủy</Button>
          <Button
            variant="contained"
            color={processData.isApproved ? 'success' : 'error'}
            onClick={handleProcessSubmit}
            sx={{ borderRadius: 1.5 }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
