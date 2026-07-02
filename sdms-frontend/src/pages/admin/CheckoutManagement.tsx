import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, CircularProgress, Alert, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { checkoutApi, CheckoutRequestResponse } from '@/api/checkoutApi';
import { snackbar } from '@/utils/snackbar';

export default function CheckoutManagement() {
  const [requests, setRequests] = useState<CheckoutRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [openReview, setOpenReview] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CheckoutRequestResponse | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async (status: string, p: number, size: number) => {
    setLoading(true);
    try {
      const data = await checkoutApi.getAllCheckoutRequests(status || undefined, p, size);
      setRequests(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      console.error(err);
      snackbar.error('Lỗi khi tải danh sách đơn trả phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(filterStatus, page, rowsPerPage);
  }, [filterStatus, page, rowsPerPage]);

  const handleOpenReview = (request: CheckoutRequestResponse, status: 'APPROVED' | 'REJECTED') => {
    setSelectedRequest(request);
    setReviewStatus(status);
    setRejectReason('');
    setOpenReview(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedRequest) return;
    if (reviewStatus === 'REJECTED' && !rejectReason.trim()) {
      snackbar.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setSubmitting(true);
    try {
      await checkoutApi.reviewCheckoutRequest(selectedRequest.requestId, {
        status: reviewStatus,
        rejectReason: reviewStatus === 'REJECTED' ? rejectReason : undefined
      });
      snackbar.success('Xét duyệt đơn trả phòng thành công!');
      setOpenReview(false);
      fetchRequests(filterStatus, page, rowsPerPage);
    } catch (err: any) {
      console.error(err);
      snackbar.error(err.response?.data?.message || 'Lỗi khi duyệt đơn');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Quản Lý Đơn Trả Phòng</Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Lọc Trạng Thái</InputLabel>
          <Select
            value={filterStatus}
            label="Lọc Trạng Thái"
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="PENDING">Chờ duyệt</MenuItem>
            <MenuItem value="APPROVED">Đã duyệt</MenuItem>
            <MenuItem value="REJECTED">Đã từ chối</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2, borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Sinh Viên</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phòng/Giường</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ngày Dự Kiến (Rời đi)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ngân Hàng (Hoàn Cọc)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    Chưa có đơn trả phòng nào.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((row) => (
                  <TableRow hover key={row.requestId}>
                    <TableCell>
                      <Typography variant="subtitle2">{row.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.studentCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">P.{row.roomCode}</Typography>
                      <Typography variant="caption" color="text.secondary">Giường {row.bedCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="error.main" fontWeight="bold">
                        {new Date(row.intendedCheckoutDate).toLocaleDateString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.bankName}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.bankAccountNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={row.status} 
                        size="small" 
                        color={row.status === 'APPROVED' ? 'success' : row.status === 'REJECTED' ? 'error' : 'warning'} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      {row.status === 'PENDING' && (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button 
                            variant="contained" 
                            color="success" 
                            size="small"
                            onClick={() => handleOpenReview(row, 'APPROVED')}
                            sx={{ minWidth: 40, p: 0.5 }}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </Button>
                          <Button 
                            variant="contained" 
                            color="error" 
                            size="small"
                            onClick={() => handleOpenReview(row, 'REJECTED')}
                            sx={{ minWidth: 40, p: 0.5 }}
                          >
                            <CancelIcon fontSize="small" />
                          </Button>
                        </Box>
                      )}
                      {row.status === 'REJECTED' && row.rejectReason && (
                        <Typography variant="caption" color="error.main" display="block">
                          {row.rejectReason}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          labelRowsPerPage="Số dòng:"
        />
      </Paper>

      {/* Review Dialog */}
      <Dialog open={openReview} onClose={() => setOpenReview(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {reviewStatus === 'APPROVED' ? 'Xác nhận Duyệt Trả Phòng' : 'Xác nhận Từ Chối Trả Phòng'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn đang thao tác với đơn trả phòng của sinh viên <b>{selectedRequest?.fullName}</b>.
            {reviewStatus === 'APPROVED' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                CẢNH BÁO: Sau khi duyệt, sinh viên sẽ bị <b>Checkout ngay lập tức</b>. Quyền ra vào KTX (FaceID/Thẻ) sẽ bị thu hồi. Hãy đảm bảo sinh viên đã dọn đồ và bàn giao tài sản.
              </Alert>
            )}
          </Typography>
          {reviewStatus === 'REJECTED' && (
            <TextField
              autoFocus
              margin="dense"
              label="Lý do từ chối (bắt buộc)"
              fullWidth
              multiline
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenReview(false)} disabled={submitting}>Hủy</Button>
          <Button 
            onClick={handleReviewSubmit} 
            variant="contained"
            color={reviewStatus === 'APPROVED' ? 'success' : 'error'}
            disabled={submitting || (reviewStatus === 'REJECTED' && !rejectReason.trim())}
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
