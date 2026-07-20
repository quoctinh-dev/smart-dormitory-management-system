import { CheckCircle, Pending, Cancel, CloudUpload } from '@mui/icons-material';
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';

import DocumentPreview from '@/components/common/DocumentPreview';

export default function ApplicationInfo({
                                          application,
                                          documents,
                                          uploadingDocId,
                                          handleResubmit,
                                        }: any) {
  return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary' }}>
          Thông tin hồ sơ
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={{ xs: 2, sm: 4 }} mb={5}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Họ và tên
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {application.fullName}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Mã định danh (CCCD)
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {application.cccd}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Số điện thoại
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {application.phone}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Địa chỉ Email
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
              {application.email}
            </Typography>
          </Grid>
        </Grid>

        {application.status === 'REQUEST_REVISION' && application.revisionDeadline && (
            <Box
                mb={4}
                p={2.5}
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.04),
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'error.light'
                }}
            >
              <Typography color="error" sx={{ fontWeight: 700, mb: 0.5 }}>
                Hạn chót bổ sung hồ sơ: {new Date(application.revisionDeadline).toLocaleString('vi-VN')}
              </Typography>
              <Typography variant="body2" color="error" sx={{ opacity: 0.85 }}>
                Vui lòng kiểm tra các giấy tờ bị đánh dấu "Không hợp lệ" phía dưới để tải lên lại bản chính xác trước thời hạn.
              </Typography>
            </Box>
        )}

        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary' }}>
          Hồ sơ đính kèm từ sinh viên
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {application.registrationFormPdfUrl || application.commitmentFormPdfUrl ? (
            <Box mb={4}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                Tài liệu hệ thống tự động khởi tạo:
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {application.registrationFormPdfUrl && (
                    <Box sx={{ flex: 1 }}>
                      <DocumentPreview
                          url={application.registrationFormPdfUrl}
                          title="Đơn đăng ký lưu trú"
                      />
                    </Box>
                )}
                {application.commitmentFormPdfUrl && (
                    <Box sx={{ flex: 1 }}>
                      <DocumentPreview url={application.commitmentFormPdfUrl} title="Bản cam kết lưu trú" />
                    </Box>
                )}
              </Stack>
            </Box>
        ) : null}

        {documents && documents.length > 0 ? (
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0 }}>
              {documents.map((doc: any, index: number) => {
                const isInvalid = doc.status === 'INVALID';
                const isValid = doc.status === 'VALID';

                return (
                    <ListItem
                        key={index}
                        sx={{
                          bgcolor: (theme) => isInvalid ? alpha(theme.palette.error.main, 0.03) : 'background.elevation1',
                          borderRadius: 4,
                          border: '1px solid',
                          borderColor: isInvalid ? 'error.light' : 'divider',
                          p: 3,
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'stretch', sm: 'center' },
                          justifyContent: 'space-between',
                          gap: 3
                        }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', flexShrink: 0 }}>
                          {isValid ? (
                              <CheckCircle color="success" />
                          ) : isInvalid ? (
                              <Cancel color="error" />
                          ) : (
                              <Pending color="warning" />
                          )}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, mb: 0.5 }} variant="body1">
                            {doc.documentType}
                          </Typography>
                          <Typography
                              variant="body2"
                              color={isValid ? 'success.main' : isInvalid ? 'error.main' : 'warning.main'}
                              sx={{ fontWeight: 600 }}
                          >
                            {isValid ? 'Giấy tờ hợp lệ' : isInvalid ? 'Không hợp lệ' : 'Đang chờ kiểm duyệt'}
                          </Typography>

                          {isInvalid && doc.note && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, pl: 1, borderLeft: '2px solid', borderColor: 'error.main' }}>
                                <strong>Lý do:</strong> {doc.note}
                              </Typography>
                          )}
                        </Box>
                      </Stack>

                      {isInvalid && application.status === 'REQUEST_REVISION' && (
                          <Box sx={{ flexShrink: 0, minWidth: { xs: '100%', sm: 180 } }}>
                            <Button
                                variant="contained"
                                color="error"
                                size="medium"
                                startIcon={
                                  uploadingDocId === doc.documentId ? (
                                      <CircularProgress size={16} color="inherit" />
                                  ) : (
                                      <CloudUpload />
                                  )
                                }
                                component="label"
                                disabled={uploadingDocId === doc.documentId}
                                fullWidth
                                sx={{ borderRadius: 3, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                            >
                              {uploadingDocId === doc.documentId ? 'Đang tải...' : 'Nộp lại bản mới'}
                              <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e: any) => handleResubmit(doc.documentId, e.target.files[0])}
                              />
                            </Button>
                          </Box>
                      )}
                    </ListItem>
                );
              })}
            </List>
        ) : (
            <Typography color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
              Chưa có tệp hồ sơ nào được đính kèm.
            </Typography>
        )}
      </Box>
  );
}