import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  CircularProgress,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useStayExtensionManagement } from '@/hooks/useStayExtensionManagement';
import StudentProfileModal from './components/StudentProfileModal';
import { DownloadRounded } from '@mui/icons-material';
import { useState, useEffect } from 'react';

function InlinePdfPreviewButton({ url, title, buttonText }: { url: string; title: string; buttonText: string }) {
  const [open, setOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open && !pdfBlobUrl) {
      setLoading(true);
      setError(false);
      fetch(url)
        .then(res => { if (!res.ok) throw new Error(); return res.blob(); })
        .then(blob => {
          setPdfBlobUrl(URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })));
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }
  }, [open, url, pdfBlobUrl]);

  return (
    <>
      <Button variant="outlined" size="small" onClick={() => setOpen(true)} sx={{ borderRadius: 2, mr: 1 }}>
        {buttonText}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
        <DialogContent dividers sx={{ p: 0, bgcolor: 'grey.100', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? <CircularProgress size={50} /> : error ? (
            <Stack alignItems="center" spacing={2}>
              <Typography color="error">Không thể xem trước tệp tin trực tuyến.</Typography>
              <Button href={url} target="_blank" download startIcon={<DownloadRounded />} variant="contained">Tải xuống PDF</Button>
            </Stack>
          ) : (
            <iframe src={pdfBlobUrl || ''} title={title} width="100%" height="780px" style={{ border: 'none' }} />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Đóng</Button>
          <Button href={pdfBlobUrl || url} download target="_blank" startIcon={<DownloadRounded />} variant="contained">Tải xuống</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function StayExtensionManagement() {
  const {
    extensions,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalElements,
    openReview,
    setOpenReview,
    selectedRequest,
    reviewStatus,
    rejectReason,
    setRejectReason,
    submitting,
    handleOpenReview,
    handleReviewSubmit,
    openProfileModal,
    setOpenProfileModal,
    selectedProfile,
    loadingProfile,
    handleOpenProfile,
  } = useStayExtensionManagement();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý gia hạn lưu trú
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Duyệt hoặc từ chối các đơn xin gia hạn thời gian lưu trú của sinh viên.
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}
      >
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Phòng hiện tại</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Thời gian thay đổi</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Lý do xin gia hạn</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {extensions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Không có dữ liệu.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  extensions.map((row) => {
                    const isApproved = row.status === 'APPROVED';
                    const isRejected = row.status === 'REJECTED';
                    return (
                      <TableRow key={row.extensionId} hover>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {row.fullName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {row.studentCode}
                            </Typography>
                            <Button 
                              size="small" 
                              variant="text" 
                              sx={{ p: 0, minWidth: 'auto', fontSize: '0.7rem' }}
                              onClick={() => handleOpenProfile(row.studentId)}
                            >
                              Xem hồ sơ
                            </Button>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            P.{row.currentRoomCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Giường {row.currentBedCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            Cũ:{' '}
                            {row.oldExpectedCheckOutAt
                              ? new Date(row.oldExpectedCheckOutAt).toLocaleDateString('vi-VN')
                              : '-'}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontSize: '0.8rem', color: 'success.main', fontWeight: 'bold' }}
                          >
                            Mới: {new Date(row.newExpectedCheckOutAt).toLocaleDateString('vi-VN')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap title={row.reason} sx={{ maxWidth: 200 }}>
                            {row.reason}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                            {row.description}
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
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleOpenReview(row, 'REJECTED')}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                          {row.status === 'APPROVED' && row.contractPdfUrl && (
                            <InlinePdfPreviewButton 
                                url={row.contractPdfUrl} 
                                title="Hợp đồng gia hạn" 
                                buttonText="Hợp đồng" 
                            />
                          )}
                          {row.status === 'APPROVED' && row.commitmentPdfUrl && (
                            <InlinePdfPreviewButton 
                                url={row.commitmentPdfUrl} 
                                title="Bản cam kết" 
                                buttonText="Cam kết" 
                            />
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
          {reviewStatus === 'APPROVED' ? 'Xác nhận duyệt gia hạn' : 'Xác nhận từ chối gia hạn'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn đang thao tác với đơn gia hạn của sinh viên <b>{selectedRequest?.fullName}</b>.
            {reviewStatus === 'APPROVED' && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                Sau khi duyệt, hệ thống sẽ kéo dài hợp đồng và tự động sinh hóa đơn thu tiền cho đợt
                lưu trú mới.
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

      {/* Reused Profile Modal */}
      <StudentProfileModal
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        loading={loadingProfile}
        profile={selectedProfile}
        hideEditButton={true}
      />
    </Box>
  );
}
