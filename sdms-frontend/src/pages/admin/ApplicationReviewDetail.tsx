import {
  CheckCircle,
  Cancel,
  ArrowBack,
  Assignment,
  PictureAsPdf,
  ReplayCircleFilled,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Card,
  CardContent,
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
import { useParams, useNavigate } from 'react-router-dom';

import { useApplicationReview } from '@/hooks/useApplicationReview';

export default function ApplicationReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    app,
    loading,
    dialogs,
    notes,
    deadlineDays,
    snackbar,
    setDeadlineDays,
    toggleDialog,
    handleNoteChange,
    handleApprove,
    handleRejectSubmit,
    handleRequestRevision,
    handleVerifyDocument,
    handleInvalidDocSubmit,
    closeSnackbar,
  } = useApplicationReview(id, navigate);

  if (loading)
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Đang tải dữ liệu hồ sơ...</Typography>
      </Box>
    );
  if (!app) return null;

  return (
    <Box>
      {/* HEADER ACTION CONTROL BAR */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/applications/review')}
          color="inherit"
        >
          Quay lại danh sách
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', ml: 3 }}>
          Kiểm Duyệt Chi Tiết Hồ Sơ
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => toggleDialog('reject', true)}
            >
              Từ Chối
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<ReplayCircleFilled />}
              onClick={() => toggleDialog('revision', true)}
            >
              Yêu Cầu Bổ Sung
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleApprove}
            >
              Duyệt Hợp Lệ
            </Button>
          </Box>
        )}
      </Box>

      {app.status === 'WAITING_LIST' && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>Lưu ý:</strong> Hồ sơ này đang nằm trong <strong>Danh sách chờ</strong> do hệ
          thống đã hết phòng trống. Bạn không thể duyệt hồ sơ lúc này. Khi có giường trống, hệ thống
          sẽ tự động chuyển hồ sơ về trạng thái Chờ duyệt.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* THÔNG TIN SINH VIÊN */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Thông Tin Sinh Viên
            </Typography>
            <List dense sx={{ p: 0 }}>
              <ListItem disableGutters>
                <ListItemText primary="Họ tên" secondary={app.fullName} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="CCCD" secondary={app.cccd} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Ngày sinh" secondary={app.dob} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Giới tính"
                  secondary={app.gender === 'MALE' ? 'Nam' : 'Nữ'}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="SĐT" secondary={app.phone} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Email" secondary={app.email} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="HKTT" secondary={app.permanentAddress} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Liên hệ" secondary={app.contactAddress} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Diện ưu tiên"
                  secondary={
                    (app.priorityCategories?.length ?? 0) > 0
                      ? (app.priorityCategories ?? []).join(', ')
                      : 'Không có'
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            {/* FILE PDF HỆ THỐNG TỰ SINH */}
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}
                >
                  <PictureAsPdf sx={{ mr: 1, color: 'error.main' }} /> Tài Liệu Sinh Tự Động (Cần
                  đối chiếu)
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* 🌟 FIX TẠI ĐÂY: Check chính xác 2 trường URL độc lập từ Backend nhả về */}
                {app.registrationFormPdfUrl || app.commitmentFormPdfUrl ? (
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {app.registrationFormPdfUrl && (
                      <Button
                        variant="contained"
                        color="error"
                        href={app.registrationFormPdfUrl}
                        target="_blank"
                        startIcon={<PictureAsPdf />}
                      >
                        Mở Phiếu Đăng Ký (PDF)
                      </Button>
                    )}

                    {app.commitmentFormPdfUrl && (
                      <Button
                        variant="outlined"
                        color="error"
                        href={app.commitmentFormPdfUrl}
                        target="_blank"
                        startIcon={<PictureAsPdf />}
                      >
                        Mở Bản Cam Kết (PDF)
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Hệ thống chưa tạo xong tệp PDF hoặc hồ sơ dính lỗi sinh file.
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* DANH SÁCH ẢNH MINH CHỨNG */}
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}
                >
                  <Assignment sx={{ mr: 1, color: 'primary.main' }} /> Minh Chứng Kèm Theo (Sinh
                  viên nộp)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {app.documents && app.documents.length > 0 ? (
                    app.documents.map((doc: any, idx: number) => {
                      const isValid = doc.status === 'VALID';
                      const isInvalid = doc.status === 'INVALID';
                      return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.documentId || idx}>
                          <Card
                            variant="outlined"
                            sx={{
                              borderRadius: 2,
                              borderColor: () =>
                                isValid ? 'success.main' : isInvalid ? 'error.main' : 'divider',
                            }}
                          >
                            <Box
                              sx={{
                                height: 150,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src={
                                  doc.fileUrl?.startsWith('http')
                                    ? doc.fileUrl
                                    : `${import.meta.env.VITE_API_URL}${doc.fileUrl}`
                                }
                                alt={doc.documentType}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  objectFit: 'contain',
                                }}
                              />
                            </Box>
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 'bold',
                                  display: 'block',
                                  textAlign: 'center',
                                  color: isInvalid ? 'error.main' : 'text.primary',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {doc.documentType} {isInvalid && '(Sai)'}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  mt: 1,
                                  gap: 1,
                                }}
                              >
                                <Button
                                  size="small"
                                  color="success"
                                  variant={isValid ? 'contained' : 'outlined'}
                                  onClick={() => handleVerifyDocument(doc.documentId, 'VALID')}
                                  fullWidth
                                >
                                  Hợp lệ
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  variant={isInvalid ? 'contained' : 'outlined'}
                                  onClick={() => handleVerifyDocument(doc.documentId, 'INVALID')}
                                  fullWidth
                                >
                                  Sai
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })
                  ) : (
                    <Typography variant="body2" sx={{ color: 'error.main', p: 2 }}>
                      Không có minh chứng đính kèm!
                    </Typography>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* DIALOGS SECTION */}
      <Dialog
        open={dialogs.reject}
        onClose={() => toggleDialog('reject', false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận từ chối hồ sơ</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Lý do từ chối cụ thể"
            fullWidth
            multiline
            rows={3}
            value={notes.reject}
            onChange={handleNoteChange('reject')}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => toggleDialog('reject', false)}>Hủy</Button>
          <Button
            onClick={handleRejectSubmit}
            variant="contained"
            color="error"
            disabled={!notes.reject.trim()}
          >
            Từ Chối
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogs.docVerify}
        onClose={() => toggleDialog('docVerify', false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
          Tài liệu không hợp lệ
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Chi tiết lỗi sai"
            fullWidth
            multiline
            rows={2}
            value={notes.doc}
            onChange={handleNoteChange('doc')}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => toggleDialog('docVerify', false)}>Hủy</Button>
          <Button
            onClick={handleInvalidDocSubmit}
            variant="contained"
            color="error"
            disabled={!notes.doc.trim()}
          >
            Xác Nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogs.revision}
        onClose={() => toggleDialog('revision', false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Yêu cầu sửa đổi bổ sung</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Lời nhắn hướng dẫn bổ sung"
            fullWidth
            multiline
            rows={3}
            value={notes.revision}
            onChange={handleNoteChange('revision')}
          />
          <TextField
            margin="dense"
            label="Thời hạn quy định (Ngày)"
            type="number"
            fullWidth
            value={deadlineDays}
            onChange={(e) => setDeadlineDays(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 1 } }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => toggleDialog('revision', false)}>Hủy</Button>
          <Button onClick={handleRequestRevision} variant="contained" color="warning">
            Gửi Yêu Cầu
          </Button>
        </DialogActions>
      </Dialog>

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
