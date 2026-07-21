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
  Alert,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';

import DocumentPreview from '@/components/common/DocumentPreview';
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
    setDeadlineDays,
    toggleDialog,
    handleNoteChange,
    handleApprove,
    handleRejectSubmit,
    handleRequestRevision,
    handleVerifyDocument,
    handleInvalidDocSubmit,
  } = useApplicationReview(id, navigate);

  // 🌟 ĐÃ FIX: Giao diện Loading mượt mà, chuyên nghiệp hơn
  if (loading)
    return (
        <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              gap: 2
            }}
        >
          <CircularProgress size={40} thickness={4} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Đang tải dữ liệu hồ sơ chi tiết...
          </Typography>
        </Box>
    );

  if (!app) return null;

  return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* HEADER ACTION CONTROL BAR */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* 🌟 ĐÃ FIX: Nút Quay lại đẹp, gọn và ra dáng Admin Dashboard */}
            <Button
                startIcon={<ArrowBack fontSize="small" />}
                onClick={() => navigate('/admin/applications/review')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 1.5,
                  mr: 2,
                  px: 2,
                  color: 'text.secondary',
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05),
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.action.hover, 0.1),
                  }
                }}
            >
              Quay lại
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Kiểm duyệt hồ sơ chi tiết
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && (
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel fontSize="small" />}
                    onClick={() => toggleDialog('reject', true)}
                    sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                  Từ chối
                </Button>
                <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<ReplayCircleFilled fontSize="small" />}
                    onClick={() => toggleDialog('revision', true)}
                    sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                  Yêu cầu bổ sung
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    disableElevation
                    startIcon={<CheckCircle fontSize="small" />}
                    onClick={handleApprove}
                    sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                  Duyệt hợp lệ
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
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                Thông tin sinh viên
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <List dense sx={{ p: 0 }}>
                <ListItem disableGutters>
                  <ListItemText primary={<Typography variant="caption" color="text.secondary">Họ tên</Typography>} secondary={<Typography variant="body2" fontWeight={500}>{app.fullName}</Typography>} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary={<Typography variant="caption" color="text.secondary">MSSV</Typography>} secondary={<Typography variant="body2" fontFamily="monospace">{app.studentCode || 'Không có'}</Typography>} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary={<Typography variant="caption" color="text.secondary">CCCD</Typography>} secondary={<Typography variant="body2" fontFamily="monospace">{app.cccd}</Typography>} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary={<Typography variant="caption" color="text.secondary">Ngày sinh</Typography>} secondary={<Typography variant="body2">{app.dob}</Typography>} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Giới tính</Typography>}
                      secondary={<Typography variant="body2">{app.gender === 'MALE' ? 'Nam' : 'Nữ'}</Typography>}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary={<Typography variant="caption" color="text.secondary">Số điện thoại</Typography>} secondary={<Typography variant="body2">{app.phone}</Typography>} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary={<Typography variant="caption" color="text.secondary">Email</Typography>} secondary={<Typography variant="body2">{app.email}</Typography>} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary={<Typography variant="caption" color="text.secondary">Hộ khẩu thường trú</Typography>} secondary={<Typography variant="body2">{app.permanentAddress}</Typography>} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary={<Typography variant="caption" color="text.secondary">Địa chỉ liên hệ</Typography>} secondary={<Typography variant="body2">{app.contactAddress}</Typography>} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Diện ưu tiên</Typography>}
                      secondary={
                        <Typography variant="body2" fontWeight={500} color={app.priorityCategories?.length ? 'primary.main' : 'text.primary'}>
                          {(app.priorityCategories?.length ?? 0) > 0
                              ? (app.priorityCategories ?? []).join(', ')
                              : 'Không có'}
                        </Typography>
                      }
                  />
                </ListItem>
              </List>
            </Paper>

            {/* HIỂN THỊ PHÂN PHÒNG DỰ KIẾN */}
            {app.assignment && (
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mt: 3, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03), borderColor: 'primary.light' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                    Xếp phòng dự kiến
                  </Typography>
                  <Typography
                      variant="caption"
                      sx={{ display: 'block', mb: 2, color: 'text.secondary' }}
                  >
                    Hệ thống đã tự động xếp chỗ (giữ giường tạm thời) khi sinh viên nộp đơn. Vị trí này
                    sẽ được chốt chính thức sau khi duyệt.
                  </Typography>
                  <List dense sx={{ p: 0 }}>
                    <ListItem disableGutters>
                      <ListItemText primary={<Typography variant="caption" color="text.secondary">Tòa nhà</Typography>} secondary={<Typography variant="body2" fontWeight={500}>{app.assignment.buildingName}</Typography>} />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary={<Typography variant="caption" color="text.secondary">Tầng</Typography>} secondary={<Typography variant="body2" fontWeight={500}>Tầng {app.assignment.floorName}</Typography>} />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary={<Typography variant="caption" color="text.secondary">Phòng</Typography>} secondary={<Typography variant="body2" fontWeight={500}>{app.assignment.roomName}</Typography>} />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary={<Typography variant="caption" color="text.secondary">Giường</Typography>} secondary={<Typography variant="body2" fontWeight={500}>{app.assignment.bedName}</Typography>} />
                    </ListItem>
                  </List>
                </Paper>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={3}>
              {/* FILE PDF HỆ THỐNG TỰ SINH */}
              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}
                  >
                    <PictureAsPdf fontSize="small" sx={{ mr: 1, color: 'error.main' }} /> Tài liệu sinh tự động (Đối chiếu)
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  {app.registrationFormPdfUrl || app.commitmentFormPdfUrl ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {app.registrationFormPdfUrl && (
                            <DocumentPreview
                                url={app.registrationFormPdfUrl}
                                title="Phiếu đăng ký (PDF)"
                            />
                        )}

                        {app.commitmentFormPdfUrl && (
                            <DocumentPreview url={app.commitmentFormPdfUrl} title="Bản cam kết (PDF)" />
                        )}
                      </Box>
                  ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        Hệ thống chưa tạo xong tệp PDF hoặc hồ sơ dính lỗi sinh file.
                      </Typography>
                  )}
                </Paper>
              </Grid>

              {/* DANH SÁCH ẢNH MINH CHỨNG */}
              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}
                  >
                    <Assignment fontSize="small" sx={{ mr: 1, color: 'primary.main' }} /> Minh chứng đính kèm (Sinh viên nộp)
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
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
                                      boxShadow: 'none',
                                    }}
                                >
                                  <Box
                                      sx={{
                                        p: 1,
                                        bgcolor: (theme) => alpha(theme.palette.action.hover, 0.03),
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                      }}
                                  >
                                    <DocumentPreview
                                        url={doc.fileUrl}
                                        title={doc.documentType}
                                        compact
                                    />
                                  </Box>
                                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 600,
                                          display: 'block',
                                          textAlign: 'center',
                                          color: isInvalid ? 'error.main' : 'text.primary',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                        title={doc.documentType}
                                    >
                                      {doc.documentType} {isInvalid && '(Sai)'}
                                    </Typography>
                                    <Box
                                        sx={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          mt: 1.5,
                                          gap: 1,
                                        }}
                                    >
                                      <Button
                                          size="small"
                                          color="success"
                                          variant={isValid ? 'contained' : 'outlined'}
                                          disableElevation={isValid}
                                          onClick={() => handleVerifyDocument(doc.documentId, 'VALID')}
                                          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                                          fullWidth
                                      >
                                        Hợp lệ
                                      </Button>
                                      <Button
                                          size="small"
                                          color="error"
                                          variant={isInvalid ? 'contained' : 'outlined'}
                                          disableElevation={isInvalid}
                                          onClick={() => handleVerifyDocument(doc.documentId, 'INVALID')}
                                          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                                          fullWidth
                                      >
                                        Lỗi sai
                                      </Button>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                          );
                        })
                    ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary', p: 1, fontStyle: 'italic' }}>
                          Không có tài liệu minh chứng nào được đính kèm.
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
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Xác nhận từ chối hồ sơ</DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            <TextField
                autoFocus
                margin="dense"
                label="Lý do từ chối cụ thể"
                placeholder="Nhập lý do để thông báo cho sinh viên..."
                fullWidth
                multiline
                rows={3}
                value={notes.reject}
                onChange={handleNoteChange('reject')}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => toggleDialog('reject', false)} sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 500, color: 'text.secondary' }}>Hủy bỏ</Button>
            <Button
                onClick={handleRejectSubmit}
                variant="contained"
                disableElevation
                color="error"
                disabled={!notes.reject.trim()}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Xác nhận từ chối
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
            open={dialogs.docVerify}
            onClose={() => toggleDialog('docVerify', false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, color: 'error.main', pb: 1 }}>
            Đánh dấu tài liệu lỗi
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            <TextField
                autoFocus
                margin="dense"
                label="Chi tiết lỗi sai"
                placeholder="Ví dụ: Ảnh bị mờ, sai thông tin..."
                fullWidth
                multiline
                rows={2}
                value={notes.doc}
                onChange={handleNoteChange('doc')}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => toggleDialog('docVerify', false)} sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 500, color: 'text.secondary' }}>Hủy bỏ</Button>
            <Button
                onClick={handleInvalidDocSubmit}
                variant="contained"
                disableElevation
                color="error"
                disabled={!notes.doc.trim()}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Xác nhận
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
            open={dialogs.revision}
            onClose={() => toggleDialog('revision', false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Yêu cầu sửa đổi, bổ sung</DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            <TextField
                autoFocus
                margin="dense"
                label="Lời nhắn hướng dẫn bổ sung"
                placeholder="Ghi rõ các tài liệu sinh viên cần cập nhật..."
                fullWidth
                multiline
                rows={3}
                value={notes.revision}
                onChange={handleNoteChange('revision')}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
            <TextField
                margin="dense"
                label="Thời hạn quy định (Ngày)"
                type="number"
                fullWidth
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                slotProps={{ htmlInput: { min: 1 } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => toggleDialog('revision', false)} sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 500, color: 'text.secondary' }}>Hủy bỏ</Button>
            <Button
                onClick={handleRequestRevision}
                variant="contained"
                disableElevation
                color="warning"
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Gửi yêu cầu
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}