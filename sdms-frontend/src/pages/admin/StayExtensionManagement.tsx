import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
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
  MenuItem,
  Select,
  InputAdornment,
  Tooltip,
  FormControl,
  InputLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useStayExtensionManagement } from '@/hooks/useStayExtensionManagement';
import StudentProfileModal from './components/StudentProfileModal';

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
          .then((res) => {
            if (!res.ok) throw new Error();
            return res.blob();
          })
          .then((blob) => {
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
        <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 1.5, textTransform: 'none', mr: 1 }}
        >
          {buttonText}
        </Button>
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>{title}</DialogTitle>
          <DialogContent dividers sx={{ p: 0, bgcolor: 'grey.100', minHeight: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? (
                <CircularProgress size={36} />
            ) : error ? (
                <Stack alignItems="center" spacing={2} sx={{ p: 4 }}>
                  <Typography color="error" variant="body2">
                    Không thể tải xem trước tệp tin.
                  </Typography>
                  <Button
                      href={url}
                      target="_blank"
                      download
                      startIcon={<DownloadRoundedIcon />}
                      variant="contained"
                      disableElevation
                      sx={{ borderRadius: 1.5, textTransform: 'none' }}
                  >
                    Tải tệp PDF
                  </Button>
                </Stack>
            ) : (
                <iframe src={pdfBlobUrl || ''} title={title} width="100%" height="700px" style={{ border: 'none' }} />
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpen(false)} color="inherit" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
              Đóng
            </Button>
            <Button
                href={pdfBlobUrl || url}
                download
                target="_blank"
                startIcon={<DownloadRoundedIcon />}
                variant="contained"
                disableElevation
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Tải xuống
            </Button>
          </DialogActions>
        </Dialog>
      </>
  );
}

const REASON_MAP: Record<string, string> = {
  ROOM_LEADER: 'Trưởng phòng / Ban tự quản',
  POLICY_BENEFICIARY: 'Diện chính sách',
  ACADEMIC_EXCELLENCE: 'Thành tích học tập',
  OTHER: 'Lý do khác',
};

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
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    handleSearchClick,
    handleSearchKeyPress,
  } = useStayExtensionManagement();

  return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header trang */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            Quản lý gia hạn lưu trú
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Xử lý các đơn xin tiếp tục lưu trú tại ký túc xá của sinh viên.
          </Typography>
        </Box>

        {/* Bộ lọc và Tìm kiếm */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm theo tên, mã sinh viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                InputProps={{
                  startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                  ),
                }}
            />
            <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
              >
                <MenuItem value="">Tất cả trạng thái</MenuItem>
                <MenuItem value="PENDING">Chờ duyệt</MenuItem>
                <MenuItem value="APPROVED">Đã duyệt</MenuItem>
                <MenuItem value="REJECTED">Đã từ chối</MenuItem>
              </Select>
            </FormControl>
            <Button
                variant="contained"
                onClick={handleSearchClick}
                disableElevation
                sx={{ minWidth: 100, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Tìm kiếm
            </Button>
          </Stack>
        </Paper>

        {/* Bảng danh sách đơn gia hạn */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
          {loading ? (
              <Box p={3}>
                <CustomSkeleton type="table" count={5} />
              </Box>
          ) : (
              <TableContainer>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Sinh viên</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Phòng ở</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Thời hạn lưu trú</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Lý do xin gia hạn</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {extensions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary" variant="body2">
                              Không có dữ liệu đơn gia hạn nào.
                            </Typography>
                          </TableCell>
                        </TableRow>
                    ) : (
                        extensions.map((row) => {
                          const isApproved = row.status === 'APPROVED';
                          const isRejected = row.status === 'REJECTED';
                          return (
                              <TableRow key={row.extensionId} hover>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {row.fullName}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {row.studentCode}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="primary.main"
                                        sx={{ cursor: 'pointer', fontWeight: 500 }}
                                        onClick={() => handleOpenProfile(row.studentId)}
                                    >
                                      Xem hồ sơ
                                    </Typography>
                                  </Box>
                                </TableCell>

                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Phòng {row.currentRoomCode}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Giường {row.currentBedCode}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    Hạn cũ: {row.oldExpectedCheckOutAt ? new Date(row.oldExpectedCheckOutAt).toLocaleDateString('vi-VN') : '-'}
                                  </Typography>
                                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                    Hạn mới: {new Date(row.newExpectedCheckOutAt).toLocaleDateString('vi-VN')}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Typography variant="body2" noWrap title={REASON_MAP[row.reason] || row.reason} sx={{ maxWidth: 220, fontWeight: 500 }}>
                                    {REASON_MAP[row.reason] || row.reason}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 220, display: 'block' }}>
                                    {row.description}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Chip
                                        label={isApproved ? 'Đã duyệt' : isRejected ? 'Đã từ chối' : 'Chờ duyệt'}
                                        size="small"
                                        color={isApproved ? 'success' : isRejected ? 'error' : 'warning'}
                                        sx={{ fontWeight: 600 }}
                                    />
                                    {isRejected && row.rejectReason && (
                                        <Tooltip title={`Lý do từ chối: ${row.rejectReason}`} arrow placement="top">
                                          <InfoOutlinedIcon color="error" fontSize="small" sx={{ cursor: 'pointer' }} />
                                        </Tooltip>
                                    )}
                                  </Stack>
                                </TableCell>

                                <TableCell align="center">
                                  {row.status === 'PENDING' && (
                                      <Stack direction="row" justifyContent="center" spacing={0.5}>
                                        <IconButton
                                            color="success"
                                            size="small"
                                            title="Duyệt đơn"
                                            onClick={() => handleOpenReview(row, 'APPROVED')}
                                        >
                                          <CheckCircleIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            size="small"
                                            title="Từ chối đơn"
                                            onClick={() => handleOpenReview(row, 'REJECTED')}
                                        >
                                          <CancelIcon fontSize="small" />
                                        </IconButton>
                                      </Stack>
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
                                </TableCell>
                              </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
          )}

          {!loading && (
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
                  labelRowsPerPage="Số dòng mỗi trang:"
              />
          )}
        </Paper>

        {/* Dialog Duyệt/Từ chối */}
        <Dialog open={openReview} onClose={() => setOpenReview(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
            {reviewStatus === 'APPROVED' ? 'Duyệt gia hạn' : 'Từ chối gia hạn'}
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Xác nhận xử lý đơn xin gia hạn của sinh viên <strong>{selectedRequest?.fullName}</strong>.
            </Typography>
            {reviewStatus === 'APPROVED' && (
                <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                  Sau khi duyệt, hệ thống sẽ tự động cập nhật hạn hợp đồng mới và tạo hóa đơn gia hạn.
                </Alert>
            )}
            {reviewStatus === 'REJECTED' && (
                <TextField
                    autoFocus
                    margin="dense"
                    label="Lý do từ chối (bắt buộc)"
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                />
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenReview(false)} disabled={submitting} color="inherit" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
              Hủy bỏ
            </Button>
            <Button
                onClick={handleReviewSubmit}
                variant="contained"
                disableElevation
                color={reviewStatus === 'APPROVED' ? 'success' : 'error'}
                disabled={submitting || (reviewStatus === 'REJECTED' && !rejectReason.trim())}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              {submitting ? 'Đang lưu...' : 'Xác nhận'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Student Profile Modal */}
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