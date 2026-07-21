import RefreshIcon from '@mui/icons-material/Refresh';
import CameraFrontIcon from '@mui/icons-material/CameraFront';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Pagination,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';
import { useState, useMemo } from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useFaceApproval } from '@/hooks/useFaceApproval';

export default function FaceApprovalQueue() {
  const {
    profiles,
    loading,
    actionLoading,
    rejectTarget,
    reason,
    setReason,
    setRejectTarget,
    handleApprove,
    handleRejectSubmit,
    fetchPendingFaces,
  } = useFaceApproval();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 12;

  const displayedProfiles = useMemo(() => {
    return profiles.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage);
  }, [profiles, page, rowsPerPage]);

  const onApproveClick = (profileId: string) => () => {
    handleApprove(profileId);
  };

  const onRejectClick = (profileId: string) => () => {
    setRejectTarget(profileId);
  };

  return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header trang */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                }}
            >
              <CameraFrontIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                Kiểm duyệt ảnh khuôn mặt
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ảnh được duyệt sẽ tự động gửi qua AI phân tích, trích xuất Vector để nạp vào hệ thống Smart Access.
              </Typography>
            </Box>
          </Box>
          <Button
              variant="outlined"
              color="inherit"
              startIcon={<RefreshIcon fontSize="small" />}
              onClick={fetchPendingFaces}
              disabled={loading}
              sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 500 }}
          >
            Làm mới dữ liệu
          </Button>
        </Box>

        {/* Nội dung chính */}
        {loading ? (
            <CustomSkeleton type="dashboard" count={1} />
        ) : profiles.length === 0 ? (
            <Paper
                variant="outlined"
                sx={{
                  py: 8,
                  px: 3,
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.02),
                  borderStyle: 'dashed',
                }}
            >
              <TaskAltIcon sx={{ fontSize: 64, color: 'success.main', opacity: 0.6, mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
                Tất cả đã được xử lý!
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Hiện tại không có ảnh khuôn mặt nào trong hàng đợi cần xét duyệt.
              </Typography>
              <Button
                  variant="contained"
                  disableElevation
                  startIcon={<RefreshIcon />}
                  onClick={fetchPendingFaces}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
              >
                Kiểm tra lại hàng đợi
              </Button>
            </Paper>
        ) : (
            <>
              <Grid container spacing={2.5}>
                {displayedProfiles.map((profile) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={profile.profileId}>
                      <Card
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            boxShadow: 'none',
                            transition: 'border-color 0.2s',
                            '&:hover': { borderColor: 'primary.main' },
                          }}
                      >
                        <CardMedia
                            component="img"
                            height="240"
                            image={profile.faceImageUrl || 'https://via.placeholder.com/240?text=No+Image'}
                            alt={profile.studentName || 'Sinh viên'}
                            sx={{ objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setPreviewImage(profile.faceImageUrl || null)}
                            title="Nhấn để phóng to ảnh"
                        />
                        <CardContent sx={{ p: 2, pb: 1.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                            {profile.studentName || 'Hồ sơ Sinh viên'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, fontFamily: 'monospace' }} noWrap>
                            MSSV: {profile.studentCode || profile.studentId}
                          </Typography>
                          <Chip
                              label="Chờ xét duyệt"
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ fontWeight: 600, borderRadius: 1 }}
                          />
                        </CardContent>
                        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                          <Stack direction="row" spacing={1} width="100%">
                            <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={onRejectClick(profile.profileId)}
                                disabled={actionLoading === profile.profileId}
                                fullWidth
                                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                            >
                              Từ chối
                            </Button>
                            <Button
                                size="small"
                                color="success"
                                variant="contained"
                                onClick={onApproveClick(profile.profileId)}
                                disabled={actionLoading === profile.profileId}
                                disableElevation
                                fullWidth
                                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                            >
                              {actionLoading === profile.profileId ? (
                                  <CircularProgress size={20} color="inherit" />
                              ) : (
                                  'Chấp nhận'
                              )}
                            </Button>
                          </Stack>
                        </CardActions>
                      </Card>
                    </Grid>
                ))}
              </Grid>

              {profiles.length > rowsPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={Math.ceil(profiles.length / rowsPerPage)}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        shape="rounded"
                    />
                  </Box>
              )}
            </>
        )}

        {/* DIALOG NHẬP LÝ DO TỪ CHỐI ẢNH */}
        <Dialog
            open={Boolean(rejectTarget)}
            onClose={() => setRejectTarget(null)}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Từ chối ảnh khuôn mặt</DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Vui lòng cung cấp lý do để sinh viên biết và chụp lại ảnh mới cho phù hợp.
            </Typography>
            <TextField
                autoFocus
                size="small"
                label="Lý do chi tiết"
                placeholder="VD: Ảnh mờ, sai góc độ, đeo kính râm, đeo khẩu trang..."
                fullWidth
                multiline
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
                onClick={() => setRejectTarget(null)}
                color="inherit"
                disabled={Boolean(actionLoading)}
                sx={{ textTransform: 'none', borderRadius: 1.5 }}
            >
              Hủy bỏ
            </Button>
            <Button
                onClick={handleRejectSubmit}
                variant="contained"
                color="error"
                disableElevation
                disabled={!reason.trim() || Boolean(actionLoading)}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
            >
              {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Xác nhận từ chối'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG XEM ẢNH PHÓNG TO */}
        <Dialog
            open={Boolean(previewImage)}
            onClose={() => setPreviewImage(null)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
                bgcolor: 'background.paper'
              }
            }}
        >
          <DialogTitle
              sx={{
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1.5,
              }}
          >
            Chi tiết ảnh khuôn mặt
            <IconButton size="small" onClick={() => setPreviewImage(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#000' : '#f5f5f5' }}>
            {previewImage && (
                <img
                    src={previewImage}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }}
                />
            )}
          </DialogContent>
        </Dialog>
      </Box>
  );
}