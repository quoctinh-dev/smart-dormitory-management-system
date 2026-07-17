import { CheckCircle, Pending, Cancel, CloudUpload } from '@mui/icons-material';
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useState } from 'react';

import applicationApi from '@/api/applicationApi';
import DocumentPreview from '@/components/common/DocumentPreview';
import { snackbar } from '@/utils/snackbar';

export default function ApplicationInfo({ application, documents, fetchStatus }: any) {
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const handleResubmit = async (docId: string, file: File) => {
    if (!file) return;
    setUploadingDocId(docId);
    try {
      // Tải file lên cloud
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await applicationApi.uploadFileToCloud(formData);
      const fileUrl = uploadRes.url;

      // Gọi API resubmit
      await applicationApi.resubmitDocument(application.applicationId, docId, fileUrl);
      snackbar.success('Nộp lại tài liệu thành công!');
      if (fetchStatus) fetchStatus(application.studentCode); // Reload
    } catch (err: any) {
      snackbar.error('Lỗi khi nộp lại: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingDocId(null);
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Thông vịn hồ sơ
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" color="text.secondary">
            Họ và tên
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {application.fullName}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" color="text.secondary">
            Mã số định danh (CCCD)
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {application.cccd}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" color="text.secondary">
            Email
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {application.email}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" color="text.secondary">
            Điện thoại
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {application.phone}
          </Typography>
        </Grid>
      </Grid>

      {application.status === 'REQUEST_REVISION' && application.revisionDeadline && (
        <Box mb={3} p={2} bgcolor="#fff1f2" borderRadius={2} border="1px solid #fda4af">
          <Typography color="error" fontWeight="bold">
            Hạn chót bổ sung hồ sơ: {new Date(application.revisionDeadline).toLocaleString('vi-VN')}
          </Typography>
          <Typography variant="body2" color="error">
            Vui lòng tải lên lại các giấy tờ bị đánh dấu "Sai" (Màu đỏ) ở bên dưới trước thời hạn
            này.
          </Typography>
        </Box>
      )}

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Hồ sơ đính kèm (Sinh viên nộp)
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Hiển thị PDF Hệ thống */}
      {(application.registrationFormPdfUrl || application.commitmentFormPdfUrl) && (
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Tài liệu hệ thống tự sinh (Vui lòng xem trước và tải về):
          </Typography>
          <Box display="grid" gap={2}>
            {application.registrationFormPdfUrl && (
              <DocumentPreview
                url={application.registrationFormPdfUrl}
                title="Đơn đăng ký lưu trú"
                
              />
            )}
            {application.commitmentFormPdfUrl && (
              <DocumentPreview
                url={application.commitmentFormPdfUrl}
                title="Bản cam kết lưu trú"
                
              />
            )}
          </Box>
        </Box>
      )}

      {documents && documents.length > 0 ? (
        <List sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {documents.map((doc: any, index: number) => (
            <ListItem
              key={index}
              sx={{
                bgcolor: doc.status === 'INVALID' ? '#fff1f2' : '#f1f5f9',
                borderRadius: 3,
                border: `1px solid ${doc.status === 'INVALID' ? '#fecdd3' : '#e2e8f0'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Box display="flex" width="100%" alignItems="center">
                <ListItemIcon>
                  {doc.status === 'VALID' ? (
                    <CheckCircle color="success" />
                  ) : doc.status === 'INVALID' ? (
                    <Cancel color="error" />
                  ) : (
                    <Pending color="warning" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography fontWeight="bold" variant="body2">
                      {doc.documentType}
                    </Typography>
                  }
                  secondary={`Trạng thái: ${doc.status === 'VALID' ? 'Hợp lệ' : doc.status === 'INVALID' ? 'Không hợp lệ' : 'Đang chờ duyệt'}`}
                />
              </Box>

              {doc.status === 'INVALID' && (
                <Box mt={1} width="100%" bgcolor="white" p={1.5} borderRadius={2}>
                  <Typography variant="caption" color="error" display="block" mb={1}>
                    <b>Lý do sai:</b> {doc.note || 'Không có ghi chú'}
                  </Typography>
                  {application.status === 'REQUEST_REVISION' && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={
                        uploadingDocId === doc.documentId ? (
                          <CircularProgress size={16} />
                        ) : (
                          <CloudUpload />
                        )
                      }
                      component="label"
                      disabled={uploadingDocId === doc.documentId}
                      fullWidth
                    >
                      {uploadingDocId === doc.documentId ? 'Đang tải...' : 'Nộp lại tài liệu'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e: any) => handleResubmit(doc.documentId, e.target.files[0])}
                      />
                    </Button>
                  )}
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography color="text.secondary" fontStyle="italic">
          Chưa có hồ sơ đính kèm.
        </Typography>
      )}
    </Box>
  );
}
