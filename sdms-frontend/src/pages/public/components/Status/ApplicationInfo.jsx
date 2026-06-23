import { Box, Typography, Divider, List, ListItem, ListItemText, ListItemIcon, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { CheckCircle, Pending, Cancel, CloudUpload } from '@mui/icons-material';
import { useState } from 'react';
import { alpha } from '@mui/material/styles';
import applicationApi from '@/api/applicationApi';

export default function ApplicationInfo({ application, documents, fetchStatus }) {
  const [uploadingDocId, setUploadingDocId] = useState(null);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleFileChange = (docId) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocId(docId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await applicationApi.uploadFileToCloud(formData);
      const fileUrl = uploadRes.data || uploadRes;

      await applicationApi.resubmitDocument(application.applicationId, docId, fileUrl);
      
      setSnackbar({
        open: true,
        message: 'Nộp lại tài liệu minh chứng thành công!',
        severity: 'success',
      });
      
      if (fetchStatus) {
        fetchStatus(application.cccd);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Lỗi khi nộp lại: ${err.response?.data?.message || err.message}`,
        severity: 'error',
      });
    } finally {
      setUploadingDocId(null);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
        Thông tin hồ sơ
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Họ và tên</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{application.fullName}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Mã số định danh (CCCD)</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{application.cccd}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Email</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{application.email}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Điện thoại</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{application.phone}</Typography>
        </Grid>
      </Grid>

      {application.status === 'REQUEST_REVISION' && application.revisionDeadline && (
        <Box 
          sx={{ 
            mb: 3, 
            p: 2, 
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.06), 
            borderRadius: 2, 
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.error.main, 0.3)
          }}
        >
          <Typography sx={{ color: 'error.main', fontWeight: 'bold' }}>
            Hạn chót bổ sung hồ sơ: {new Date(application.revisionDeadline).toLocaleString('vi-VN')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'error.main', mt: 0.5 }}>
            Vui lòng tải lên lại các giấy tờ bị đánh dấu "Không hợp lệ" (Màu đỏ) ở bên dưới trước thời hạn này.
          </Typography>
        </Box>
      )}

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
        Hồ sơ đính kèm
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {documents && documents.length > 0 ? (
        <List sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {documents.map((doc) => {
            const isInvalid = doc.status === 'INVALID';
            const isValid = doc.status === 'VALID';
            
            return (
              <ListItem 
                key={doc.documentId || doc.documentType} 
                sx={{ 
                  bgcolor: (theme) => isInvalid 
                    ? alpha(theme.palette.error.main, 0.04) 
                    : alpha(theme.palette.action.hover, 0.02), 
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: (theme) => isInvalid 
                    ? alpha(theme.palette.error.main, 0.2) 
                    : 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  p: 2,
                  minWidth: 0 
                }}
              >
                <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', minWidth: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {isValid ? <CheckCircle color="success" /> : 
                     isInvalid ? <Cancel color="error" /> : 
                     <Pending color="warning" />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {doc.documentType}
                      </Typography>
                    } 
                    secondary={`Trạng thái: ${isValid ? 'Hợp lệ' : isInvalid ? 'Không hợp lệ' : 'Đang chờ duyệt'}`} 
                    sx={{ minWidth: 0, m: 0 }}
                  />
                </Box>
                
                {isInvalid && (
                  <Box sx={{ mt: 1.5, width: '100%', bgcolor: 'background.paper', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mb: 1, textAlign: 'justify' }}>
                      <b>Lý do sai:</b> {doc.note || 'Không có ghi chú chi tiết từ người kiểm duyệt.'}
                    </Typography>
                    
                    {application.status === 'REQUEST_REVISION' && (
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small" 
                        startIcon={uploadingDocId === doc.documentId ? <CircularProgress size={16} color="inherit" /> : <CloudUpload />}
                        component="label"
                        disabled={uploadingDocId !== null}
                        fullWidth
                        sx={{ mt: 0.5 }}
                      >
                        {uploadingDocId === doc.documentId ? 'Đang xử lý...' : 'Nộp lại tài liệu'}
                        <input 
                          type="file" 
                          hidden 
                          accept="image/*,application/pdf"
                          onChange={handleFileChange(doc.documentId)} 
                        />
                      </Button>
                    )}
                  </Box>
                )}
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Chưa có hồ sơ đính kèm nào được tải lên.
        </Typography>
      )}

      {/* COMPONENT SNACKBAR CHUẨN UX GIAO DIỆN HỆ THỐNG */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}