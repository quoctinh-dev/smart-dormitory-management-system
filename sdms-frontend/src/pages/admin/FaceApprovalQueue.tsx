import RefreshIcon from '@mui/icons-material/Refresh';
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
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';

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

  const onApproveClick = (profileId: string) => () => {
    handleApprove(profileId);
  };

  const onRejectClick = (profileId: string) => () => {
    setRejectTarget(profileId);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Kiểm Duyệt Ảnh Khuôn Mặt
        </Typography>
        <Tooltip title="Tải lại danh sách">
          <IconButton onClick={fetchPendingFaces} disabled={loading} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
        Ảnh chân dung được duyệt sẽ tự động được gửi qua AI phân tích, trích xuất Vector để nạp vào
        hệ thống Edge điều khiển mở cổng.
      </Typography>

      {loading ? (
        <CustomSkeleton type="dashboard" count={1} />
      ) : profiles.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
          }}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png"
            alt="Empty"
            style={{ width: 120, opacity: 0.5, marginBottom: 16 }}
          />
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Tất cả đã được xử lý!
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            Hiện tại không có ảnh khuôn mặt nào trong hàng đợi chờ duyệt.
          </Typography>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchPendingFaces}>
            Kiểm tra lại
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {profiles.map((profile) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={profile.profileId}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  boxShadow: 'none',
                  transition: '0.2s',
                  '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
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
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }} noWrap>
                    {profile.studentName || 'Hồ sơ Sinh viên'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }} noWrap>
                    Mã số SV: {profile.studentId}
                  </Typography>
                  <Chip
                    label="Chờ xét duyệt"
                    size="small"
                    color="warning"
                    sx={{ fontWeight: 600, borderRadius: 1.5 }}
                  />
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between', gap: 1 }}>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={onRejectClick(profile.profileId)}
                    disabled={actionLoading === profile.profileId}
                    fullWidth
                    sx={{ borderRadius: 1.5 }}
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
                    sx={{ borderRadius: 1.5 }}
                  >
                    {actionLoading === profile.profileId ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Chấp nhận'
                    )}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* DIALOG NHẬP LÝ DO TỪ CHỐI ẢNH */}
      <Dialog
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Lý do từ chối ảnh</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Lý do này sẽ được gửi trực tiếp đến App của sinh viên để họ chụp lại ảnh mới.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Chi tiết (VD: Ảnh mờ, sai góc độ, đeo khẩu trang...)"
            fullWidth
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setRejectTarget(null)} disabled={Boolean(actionLoading)}>
            Hủy
          </Button>
          <Button
            onClick={handleRejectSubmit}
            variant="contained"
            color="error"
            disabled={!reason.trim() || Boolean(actionLoading)}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Xác Nhận'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG XEM ẢNH PHÓNG TO */}
      <Dialog
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Chi tiết khuôn mặt
          <Button onClick={() => setPreviewImage(null)} color="inherit">
            Đóng
          </Button>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 0, bgcolor: '#000' }}>
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
