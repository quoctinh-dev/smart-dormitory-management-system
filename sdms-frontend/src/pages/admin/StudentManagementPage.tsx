import React, { useState } from 'react';
import {
  Box,
  Card,
  Container,
  Stack,
  Typography,
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
  Paper,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { useStudentManagement, Student } from '@/hooks/useStudentManagement';
import { alpha } from '@mui/material/styles';

const STATUS_MAP: Record<string, { label: string; color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" }> = {
  ACTIVE: { label: 'Đang ở', color: 'success' },
  INACTIVE: { label: 'Đã rời', color: 'default' },
  PENDING_CHECKIN: { label: 'Chờ nhận phòng', color: 'warning' },
  GRADUATED: { label: 'Đã ra trường', color: 'info' },
};

export default function StudentManagementPage() {
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
    
    // Nếu có nhập/thay đổi RFID
    if (success && rfidCode !== undefined && rfidCode !== editStudent.rfidCode) {
       success = await handleAssignRfid(editStudent.studentId, rfidCode);
    }
    
    if (success) {
      handleCloseEdit();
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Quản lý Sinh viên
        </Typography>
        <Typography color="text.secondary">
          Tra cứu, theo dõi và cập nhật thông tin cá nhân của tất cả sinh viên trong hệ thống.
        </Typography>
      </Box>

      <Card sx={{ p: 2, mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Tìm kiếm theo Mã SV, Họ Tên..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: { xs: '100%', md: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Select
            size="small"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
            {Object.entries(STATUS_MAP).map(([key, val]) => (
              <MenuItem key={key} value={key}>{val.label}</MenuItem>
            ))}
          </Select>
        </Stack>
      </Card>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Sinh viên</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Liên hệ</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Lớp / Khoa</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phòng hiện tại</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.studentId} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {student.fullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {student.studentCode} • {student.gender === 'MALE' ? 'Nam' : 'Nữ'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{student.phone}</Typography>
                  <Typography variant="caption" color="text.secondary">{student.email}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{student.studentClass}</Typography>
                  <Typography variant="caption" color="text.secondary">{student.faculty}</Typography>
                </TableCell>
                <TableCell>
                  {student.roomCode ? (
                    <>
                      <Typography variant="body2" fontWeight={500}>
                        Phòng {student.roomCode}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Giường {student.bedCode}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      Chưa xếp phòng
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={STATUS_MAP[student.status]?.label || student.status} 
                    color={STATUS_MAP[student.status]?.color || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpenEdit(student)} title="Chỉnh sửa hồ sơ">
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Không tìm thấy sinh viên nào</Typography>
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
      />

      <Dialog open={!!editStudent} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Cập nhật hồ sơ sinh viên</DialogTitle>
        <DialogContent dividers>
          {editStudent && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Thông tin cơ bản
                </Typography>
                <Typography variant="body1" fontWeight={600}>{editStudent.fullName} ({editStudent.studentCode})</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Họ tên"
                  size="small"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mã SV"
                  size="small"
                  value={editForm.studentCode || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, studentCode: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CCCD"
                  size="small"
                  value={editForm.cccd || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, cccd: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  size="small"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  size="small"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Địa chỉ liên hệ gia đình"
                  size="small"
                  value={editForm.contactAddress || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, contactAddress: e.target.value }))}
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Khoa"
                  size="small"
                  value={editForm.faculty || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, faculty: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Khóa/Niên khóa"
                  size="small"
                  value={editForm.academicYear || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, academicYear: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Họ tên Cha"
                  size="small"
                  value={editForm.fatherName || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fatherName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SĐT Cha"
                  size="small"
                  value={editForm.fatherPhone || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fatherPhone: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Họ tên Mẹ"
                  size="small"
                  value={editForm.motherName || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, motherName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SĐT Mẹ"
                  size="small"
                  value={editForm.motherPhone || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, motherPhone: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                    Cấu hình quyền truy cập (Smart Access)
                  </Typography>
                  <TextField
                    fullWidth
                    label="Mã RFID"
                    size="small"
                    value={editForm.rfidCode || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, rfidCode: e.target.value }))}
                  />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} color="inherit">Hủy</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">Lưu thay đổi</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
