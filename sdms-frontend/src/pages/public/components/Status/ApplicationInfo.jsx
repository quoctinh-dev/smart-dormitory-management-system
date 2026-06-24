import React from 'react';
import { Box, Typography, Paper, Grid, Button, Divider } from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';

const ApplicationInfo = ({ application }) => {
  if (!application) {
    return null;
  }

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Thông tin hồ sơ đăng ký
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            <strong>Mã hồ sơ:</strong> {application.applicationCode}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            <strong>Họ và tên:</strong> {application.fullName}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            <strong>CCCD:</strong> {application.cccd}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            <strong>Email:</strong> {application.email}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            <strong>Số điện thoại:</strong> {application.phone}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            <strong>Ngày sinh:</strong> {application.dob}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            <strong>Giới tính:</strong> {application.gender === 'MALE' ? 'Nam' : 'Nữ'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            <strong>Địa chỉ thường trú:</strong> {application.permanentAddress}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <strong>Địa chỉ liên hệ:</strong> {application.contactAddress}
          </Typography>
        </Grid>

        {/* 🌟 NÂNG CẤP KHU VỰC TÀI LIỆU PDF CHUYÊN NGHIỆP */}
        {(application.registrationFormPdfUrl || application.commitmentFormPdfUrl) && (
          <Grid item xs={12} sx={{ mt: 1 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1.5 }}>
              Tài liệu đính kèm hệ thống
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              
              {application.registrationFormPdfUrl && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<PictureAsPdf />}
                  href={application.registrationFormPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ borderRadius: 2 }}
                >
                  Xem Phiếu Đăng Ký
                </Button>
              )}

              {application.commitmentFormPdfUrl && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<PictureAsPdf />}
                  href={application.commitmentFormPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ borderRadius: 2 }}
                >
                  Xem Bản Cam Kết
                </Button>
              )}

            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default ApplicationInfo;