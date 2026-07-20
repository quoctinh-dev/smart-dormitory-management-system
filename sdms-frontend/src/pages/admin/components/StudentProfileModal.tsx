import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import React from 'react';

interface StudentProfileModalProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  profile: any;
  onOpenEditAcademic?: () => void;
  hideEditButton?: boolean;
}

export default function StudentProfileModal({
                                              open,
                                              onClose,
                                              loading,
                                              profile,
                                              onOpenEditAcademic,
                                              hideEditButton = false,
                                            }: StudentProfileModalProps) {
  const theme = useTheme();

  if (!open) return null;

  return (
      <Dialog
          open={open}
          onClose={onClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, overflow: 'hidden' },
          }}
      >
        {/* ── Header Modal ───────────────────────── */}
        <DialogTitle
            sx={{
              fontWeight: 800,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: 2.5,
              px: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <BadgeIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
                Hồ sơ Sinh viên
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Dữ liệu cá nhân chính thức lưu trữ tại KTX STU
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* ── Content Modal ───────────────────────── */}
        <DialogContent sx={{ p: 4, bgcolor: (theme) => alpha(theme.palette.background.default, 0.4) }}>
          {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">Đang tải dữ liệu...</Typography>
              </Box>
          ) : profile ? (
              <Grid container spacing={3}>

                {/* Nhóm 1: Thông tin học vụ */}
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderStyle: 'dashed' }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 2.5,
                          color: 'primary.main',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                    >
                      <SchoolIcon fontSize="small" /> THÔNG TIN HỌC VỤ & HỆ THỐNG
                    </Typography>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block">Mã sinh viên</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">{profile.studentCode}</Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block">Mã thẻ RFID tích hợp</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {profile.rfidCode ? (
                              <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: alpha(theme.palette.success.main, 0.08), color: theme.palette.success.dark, px: 1, py: 0.2, borderRadius: 1 }}>
                                {profile.rfidCode}
                              </Box>
                          ) : (
                              <Typography variant="caption" color="text.disabled">Chưa được gán</Typography>
                          )}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.2 }}>Khoa / Chuyên ngành</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="bold">{profile.faculty || '—'}</Typography>
                          {!hideEditButton && (
                            <Tooltip title="Chỉnh sửa học vụ">
                              <IconButton
                                  size="small"
                                  onClick={onOpenEditAcademic}
                                  sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    p: 0.5,
                                    borderRadius: 1.5,
                                    bgcolor: 'background.paper',
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                                      borderColor: theme.palette.primary.light,
                                      color: theme.palette.primary.main,
                                    }
                                  }}
                              >
                                <EditIcon sx={{ fontSize: 13 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block">Khóa học / Niên khóa</Typography>
                        <Typography variant="body2" fontWeight="bold">{profile.academicYear || '—'}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Nhóm 2: Thông tin cá nhân & liên hệ */}
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderStyle: 'dashed' }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 2.5,
                          color: 'primary.main',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                    >
                      <FingerprintIcon fontSize="small" /> DANH TÍNH CÁ NHÂN & LIÊN HỆ
                    </Typography>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Họ và tên</Typography>
                        <Typography variant="body2" fontWeight="bold">{profile.fullName}</Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Giới tính</Typography>
                        <Typography variant="body2" fontWeight="bold">{profile.gender === 'MALE' ? 'Nam' : 'Nữ'}</Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Ngày sinh</Typography>
                        <Typography variant="body2" fontWeight="bold">{profile.dateOfBirth || profile.dob}</Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Dân tộc</Typography>
                        <Typography variant="body2" fontWeight="bold">{profile.ethnicity}</Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Số CCCD / Hộ chiếu</Typography>
                        <Typography variant="body2" fontWeight="bold">{profile.nationalId || profile.cccd}</Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Số điện thoại liên hệ</Typography>
                        <Typography variant="body2" fontWeight="bold">{profile.phone}</Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Địa chỉ Email học tập</Typography>
                        <Typography variant="body2" fontWeight="medium" color="primary.main">{profile.email}</Typography>
                      </Grid>

                      <Grid item xs={12} sm={8}>
                        <Typography variant="caption" color="text.secondary" display="block">Địa chỉ thường trú</Typography>
                        <Typography variant="body2" fontWeight="medium">{profile.permanentAddress}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Nhóm 3: Thông tin gia đình */}
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderStyle: 'dashed' }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 2.5,
                          color: 'primary.main',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                    >
                      <FamilyRestroomIcon fontSize="small" /> QUAN HỆ GIA ĐÌNH & KHẨN CẤP
                    </Typography>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Họ tên Cha</Typography>
                        <Typography variant="body2" fontWeight="bold">{profile.fatherName || '—'}</Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Số điện thoại Cha</Typography>
                        <Typography variant="body2" fontWeight="bold">{profile.fatherPhone || '—'}</Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Họ tên Mẹ</Typography>
                        <Typography variant="body2" fontWeight="bold">{profile.motherName || '—'}</Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Số điện thoại Mẹ</Typography>
                        <Typography variant="body2" fontWeight="bold">{profile.motherPhone || '—'}</Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={8}>
                        <Typography variant="caption" color="text.secondary" display="block">Liên hệ khẩn cấp (Họ tên - SĐT - Quan hệ)</Typography>
                        <Typography variant="body2" fontWeight="bold" color="error.main">{profile.emergencyContact || '—'}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

              </Grid>
          ) : (
              <Typography color="error">Không có dữ liệu hợp lệ.</Typography>
          )}
        </DialogContent>

        {/* ── Actions Modal ───────────────────────── */}
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
              onClick={onClose}
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                px: 4,
              }}
          >
            Đóng hồ sơ
          </Button>
        </DialogActions>
      </Dialog>
  );
}