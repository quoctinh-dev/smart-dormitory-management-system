import { CheckCircle, Cancel } from '@mui/icons-material';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useCheckoutManagement } from '@/hooks/useCheckoutManagement';

export default function CheckoutManagement() {
  const {
    requests,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalElements,
    statusFilter,
    setStatusFilter,
    openReview,
    setOpenReview,
    selectedRequest,
    reviewStatus,
    rejectReason,
    setRejectReason,
    submitting,
    handleOpenReview,
    handleReviewSubmit,
  } = useCheckoutManagement();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý trả phòng
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Duyệt yêu cầu trả phòng (Checkout) và quản lý tiến trình hoàn tiền cho sinh viên.
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'background.paper', borderRadius: 2 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label="Trạng thái"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="PENDING">Chờ xử lý</MenuItem>
              <MenuItem value="APPROVED">Đã duyệt</MenuItem>
              <MenuItem value="REJECTED">Bị từ chối</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box p={3}>
            <CustomSkeleton type="table" count={5} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sinh viên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Phòng trả</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ngày Checkout (DK)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Thông tin hoàn tiền</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Không có dữ liệu.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((row) => {
                    const isApproved = row.status === 'APPROVED';
                    const isRejected = row.status === 'REJECTED';
                    return (
                      <TableRow key={row.requestId} hover>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">{row.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.studentCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            P.{row.roomCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Giường {row.bedCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="error.main" fontWeight="bold">
                            {new Date(row.intendedCheckoutDate).toLocaleDateString('vi-VN')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium" noWrap title={row.bankName}>
                            {row.bankName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.bankAccountNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={isApproved ? 'Đã duyệt' : isRejected ? 'Từ chối' : 'Chờ duyệt'}
                            size="small"
                            color={isApproved ? 'success' : isRejected ? 'error' : 'warning'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {row.status === 'PENDING' && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleOpenReview(row, 'APPROVED')}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleOpenReview(row, 'REJECTED')}
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                          {row.status === 'REJECTED' && row.rejectReason && (
                            <Typography variant="caption" color="error.main" title={row.rejectReason} noWrap sx={{ maxWidth: 100 }}>
                              {row.rejectReason}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalElements || 0}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Số dòng/trang:"
            />
          </TableContainer>
        )}
      </Paper>

      {/* Review Dialog */}
      <Dialog open={openReview} onClose={() => setOpenReview(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {reviewStatus === 'APPROVED' ? 'Xác nhận duyệt trả phòng' : 'Xác nhận từ chối trả phòng'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn đang thao tác với đơn trả phòng của sinh viên <b>{selectedRequest?.fullName}</b>.
            {reviewStatus === 'APPROVED' && (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                CẢNH BÁO: Sau khi duyệt, sinh viên sẽ bị <b>Checkout ngay lập tức</b>. Quyền ra vào
                KTX (FaceID/Thẻ) sẽ bị thu hồi. Hãy đảm bảo sinh viên đã dọn đồ và bàn giao tài sản.
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
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setOpenReview(false)} disabled={submitting} sx={{ borderRadius: 2 }}>
            Hủy
          </Button>
          <Button
            onClick={handleReviewSubmit}
            variant="contained"
            color={reviewStatus === 'APPROVED' ? 'success' : 'error'}
            disabled={submitting || (reviewStatus === 'REJECTED' && !rejectReason.trim())}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
