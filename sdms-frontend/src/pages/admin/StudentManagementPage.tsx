import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { useStudentManagement, Student } from '@/hooks/useStudentManagement';
import { useAuth } from '@/providers/AuthProvider';
import { alpha } from '@mui/material/styles';

const STATUS_MAP: Record<string, { label: string; color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" }> = {
  ACTIVE: { label: 'Đang ở', color: 'success' },
  INACTIVE: { label: 'Đã rời', color: 'default' },
  PENDING_CHECKIN: { label: 'Chờ nhận phòng', color: 'warning' },
  GRADUATED: { label: 'Đã tốt nghiệp', color: 'info' },
};

export default function StudentManagementPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  const {
    students,
    totalElements,
    page,
    rowsPerPage,
    search,
    status,
    setPage,
    setRowsPerPage,
    setSearch,
    setStatus,
    handleUpdateStudent,
    handleAssignRfid,
  } = useStudentManagement();

  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<Partial<Student>>({});

  const handleOpenEdit = (student: Student) => {
    setEditStudent(student);
    setEditForm({
      fullName: student.fullName,
      studentCode: student.studentCode,
      cccd: student.cccd,
      email: student.email,
      phone: student.phone,
      contactAddress: student.contactAddress,
      permanentAddress: student.permanentAddress,
      faculty: student.faculty,
      academicYear: student.academicYear,
      fatherName: student.fatherName,
      fatherPhone: student.fatherPhone,
      motherName: student.motherName,
      motherPhone: student.motherPhone,
      rfidCode: student.rfidCode,
    });
  };

  const handleCloseEdit = () => {
    setEditStudent(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editStudent) return;
    const { rfidCode, ...profileData } = editForm;
    let success = await handleUpdateStudent(editStudent.studentId, profileData);

    if (success && rfidCode !== undefined && rfidCode !== editStudent.rfidCode) {
      success = await handleAssignRfid(editStudent.studentId, rfidCode);
    }

    if (success) {
      handleCloseEdit();
    }
  };

  return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header trang */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            Quản lý sinh viên
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tra cứu, quản lý và cập nhật thông tin hồ sơ sinh viên trong hệ thống.
          </Typography>
        </Box>

        {/* Thanh tìm kiếm và bộ lọc */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
                size="small"
                placeholder="Tìm kiếm theo mã số, họ tên..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                sx={{ minWidth: { xs: '100%', sm: 320 } }}
                InputProps={{
                  startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                  ),
                }}
            />
            <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
              <InputLabel>Trạng thái cư trú</InputLabel>
              <Select
                  value={status}
                  label="Trạng thái cư trú"
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(0);
                  }}
              >
                <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                {Object.entries(STATUS_MAP).map(([key, val]) => (
                    <MenuItem key={key} value={key}>{val.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Bảng danh sách sinh viên */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Sinh viên</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Thông tin liên hệ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Khoa / Lớp</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Chỗ ở hiện tại</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                    <TableRow key={student.studentId} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {student.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.studentCode} • {student.gender === 'MALE' ? 'Nam' : 'Nữ'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{student.phone || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">{student.email}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{student.faculty || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">{student.studentClass}</Typography>
                      </TableCell>

                      <TableCell>
                        {student.roomCode ? (
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Phòng {student.roomCode}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Giường {student.bedCode}
                              </Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.disabled">
                              Chưa xếp phòng
                            </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                            label={STATUS_MAP[student.status]?.label || student.status}
                            color={STATUS_MAP[student.status]?.color || 'default'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        {isAdmin ? (
                            <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleOpenEdit(student)}
                                title="Chỉnh sửa thông tin"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                        ) : (
                            <Typography variant="caption" color="text.disabled">
                                Không có quyền
                            </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                ))}

                {students.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary" variant="body2">
                          Không tìm thấy dữ liệu sinh viên.
                        </Typography>
                      </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
              component="div"
              count={totalElements}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Số dòng mỗi trang:"
          />
        </Paper>

        {/* Hộp thoại chỉnh sửa thông tin */}
        <Dialog
            open={!!editStudent}
            onClose={handleCloseEdit}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 1.5 }}>
            Cập nhật hồ sơ sinh viên
          </DialogTitle>

          {/* TRỊ LỖI CẮT CHỮ: Bật dividers lại và thêm margin-top cho Grid */}
          <DialogContent dividers sx={{ py: 2.5 }}>
            {editStudent && (
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Họ và tên"
                        size="small"
                        value={editForm.fullName || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Mã sinh viên"
                        size="small"
                        value={editForm.studentCode || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, studentCode: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Số CCCD/CMND"
                        size="small"
                        value={editForm.cccd || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, cccd: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Địa chỉ Email"
                        size="small"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Số điện thoại"
                        size="small"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Địa chỉ báo tin"
                        size="small"
                        value={editForm.contactAddress || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, contactAddress: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Địa chỉ thường trú"
                        size="small"
                        multiline
                        rows={2}
                        value={editForm.permanentAddress || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, permanentAddress: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Khoa"
                        size="small"
                        value={editForm.faculty || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, faculty: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Khóa học"
                        size="small"
                        value={editForm.academicYear || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, academicYear: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Họ tên cha"
                        size="small"
                        value={editForm.fatherName || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, fatherName: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="SĐT cha"
                        size="small"
                        value={editForm.fatherPhone || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, fatherPhone: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Họ tên mẹ"
                        size="small"
                        value={editForm.motherName || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, motherName: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="SĐT mẹ"
                        size="small"
                        value={editForm.motherPhone || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, motherPhone: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1, mb: 1.5 }}>
                      Thông tin thẻ kiểm soát ra vào
                    </Typography>
                    <TextField
                        fullWidth
                        label="Mã thẻ RFID"
                        size="small"
                        value={editForm.rfidCode || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, rfidCode: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Grid>
                </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
            <Button onClick={handleCloseEdit} color="inherit" sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}>
              Hủy bỏ
            </Button>
            <Button
                onClick={handleSaveEdit}
                variant="contained"
                disableElevation
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 3 }}
            >
              Lưu thay đổi
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}