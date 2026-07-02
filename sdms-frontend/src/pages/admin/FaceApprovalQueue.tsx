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
  Snackbar,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useFaceApproval } from '@/hooks/useFaceApproval';

export default function FaceApprovalQueue() {
  const {
    profiles,
    loading,
    snackbar,
    rejectTarget,
    reason,
    setReason,
    setRejectTarget,
    handleApprove,
    handleRejectSubmit,
    closeSnackbar,
  } = useFaceApproval();

  const onApproveClick = (profileId: string) => () => {
    handleApprove(profileId);
  };

  const onRejectClick = (profileId: string) => () => {
    setRejectTarget(profileId);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
        Kiểm Duyệt Ảnh Khuôn Mặt
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
        Ảnh chân dung được duyệt sẽ dùng làm mẫu AI nạp vào hệ thống Edge điều khiển mở cổng tự
        động.
      </Typography>

      {loading ? (
        <CustomSkeleton type="dashboard" count={1} />
      ) : profiles.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
          }}
        >
          <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            Hiện tại không có ảnh khuôn mặt nào trong hàng đợi chờ duyệt.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {profiles.map((profile) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={profile.profileId}>
              <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 'none' }}>
                <CardMedia
                  component="img"
                  height="240"
                  image={
                    profile.pendingFaceImageUrl || 'https://via.placeholder.com/240?text=No+Image'
                  }
                  alt={profile.studentName || 'Sinh viên'}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }} noWrap>
                    {profile.studentName || 'Sinh viên nội trú'}
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
                    disableElevation
                    fullWidth
                    sx={{ borderRadius: 1.5 }}
                  >
                    Chấp nhận
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* DIALOG NHẬP LÝ DO TỪ CHỐI ẢNH CHUẨN UX BẢO VỆ TIẾN TRÌNH RUNTIME */}
      <Dialog
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Lý do từ chối ảnh</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Chi tiết (Ảnh mờ, sai góc độ, đeo khẩu trang...)"
            fullWidth
            multiline
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setRejectTarget(null)}>Hủy</Button>
          <Button
            onClick={handleRejectSubmit}
            variant="contained"
            color="error"
            disabled={!reason.trim()}
          >
            Xác Nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR THÔNG BÁO TIẾN ĐỘ */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
