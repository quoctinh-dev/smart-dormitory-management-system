import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, CircularProgress, Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { stayExtensionApi, StayExtensionResponse } from '@/api/stayExtensionApi';
import { snackbar } from '@/utils/snackbar';

export default function StayExtensionManagement() {
  const [extensions, setExtensions] = useState<StayExtensionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [openReview, setOpenReview] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StayExtensionResponse | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchExtensions = async (p: number, size: number) => {
    setLoading(true);
    try {
      const data = await stayExtensionApi.getAllExtensions(p, size);
      setExtensions(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      console.error(err);
      snackbar.error('Lỗi khi tải danh sách gia hạn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExtensions(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleOpenReview = (request: StayExtensionResponse, status: 'APPROVED' | 'REJECTED') => {
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
      await stayExtensionApi.reviewExtension(selectedRequest.extensionId, {
        status: reviewStatus,
        rejectReason: reviewStatus === 'REJECTED' ? rejectReason : undefined
      });
      snackbar.success('Xét duyệt đơn gia hạn thành công!');
      setOpenReview(false);
      fetchExtensions(page, rowsPerPage);
    } catch (err: any) {
      console.error(err);
      snackbar.error(err.response?.data?.message || 'Lỗi khi duyệt đơn');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Quản Lý Gia Hạn Lưu Trú</Typography>
      
      <Paper sx={{ width: '100%', mb: 2, borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Sinh Viên</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Giường Hiện Tại</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Thời Gian</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Lý Do</TableCell>
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
              ) : extensions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    Chưa có đơn gia hạn nào.
                  </TableCell>
                </TableRow>
              ) : (
                extensions.map((row) => (
                  <TableRow hover key={row.extensionId}>
                    <TableCell>
                      <Typography variant="subtitle2">{row.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.studentCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">P.{row.currentRoomCode}</Typography>
                      <Typography variant="caption" color="text.secondary">Giường {row.currentBedCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        Cũ: {row.oldExpectedCheckOutAt ? new Date(row.oldExpectedCheckOutAt).toLocaleDateString('vi-VN') : '-'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'success.main', fontWeight: 'bold' }}>
                        Mới: {new Date(row.newExpectedCheckOutAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" noWrap title={row.reason}>{row.reason}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>{row.description}</Typography>
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
                      {row.status === 'APPROVED' && row.pdfUrl && (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          href={row.pdfUrl} 
                          target="_blank"
                        >
                          Xem Hợp Đồng
                        </Button>
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
          {reviewStatus === 'APPROVED' ? 'Xác nhận Duyệt Gia Hạn' : 'Xác nhận Từ Chối Gia Hạn'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn đang thao tác với đơn gia hạn của sinh viên <b>{selectedRequest?.fullName}</b>.
            {reviewStatus === 'APPROVED' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Sau khi duyệt, hệ thống sẽ kéo dài hợp đồng và tự động sinh hóa đơn thu tiền cho đợt lưu trú mới.
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
