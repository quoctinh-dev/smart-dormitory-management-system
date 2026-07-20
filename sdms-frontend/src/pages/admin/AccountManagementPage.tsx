import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';

import axiosClient from '@/api/axios-client';
import StudentProfileModal from './components/StudentProfileModal';
import CustomSkeleton from '@/components/common/CustomSkeleton';
import { snackbar } from '@/helpers/snackbar';
import { validatePassword } from '@/helpers/validate';

interface UserAccount {
  accountId: string;
  username: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string | null;
}

export default function AccountManagementPage() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);

  // Lọc và Tìm kiếm
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  // Phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Create Staff State
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ username: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  // Student Profile State
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Edit Academic Info State
  const [openEditAcademicModal, setOpenEditAcademicModal] = useState(false);
  const [editAcademicForm, setEditAcademicForm] = useState({ faculty: '', academicYear: '' });
  const [savingAcademic, setSavingAcademic] = useState(false);

  const handleViewProfile = async (accountId: string) => {
    setSelectedAccountId(accountId);
    setLoadingProfile(true);
    setOpenProfileModal(true);
    try {
      const res: any = await axiosClient.get(`/v1/admin/accounts/${accountId}/student-profile`);
      setSelectedProfile(res);
      setEditAcademicForm({
        faculty: res.faculty || '',
        academicYear: res.academicYear || '',
      });
    } catch {
      snackbar.error('Không thể lấy thông tin hồ sơ sinh viên');
      setOpenProfileModal(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveAcademicInfo = async () => {
    if (!editAcademicForm.faculty || !editAcademicForm.academicYear) {
      snackbar.error('Vui lòng nhập đầy đủ Khoa và Khóa/Niên khóa!');
      return;
    }
    setSavingAcademic(true);
    try {
      const res: any = await axiosClient.patch(`/v1/admin/accounts/${selectedAccountId}/student-profile/academic`, editAcademicForm);
      snackbar.success('Cập nhật học vụ thành công!');
      setSelectedProfile(res);
      setOpenEditAcademicModal(false);
    } catch (err: any) {
      snackbar.error(err?.message || 'Lỗi khi cập nhật học vụ');
    } finally {
      setSavingAcademic(false);
    }
  };

  const fetchAccounts = async (
    currentPage: number,
    currentSize: number,
    currentKeyword: string,
    currentRole: string,
    currentStatus: string
  ) => {
    setLoading(true);
    try {
      const response: any = await axiosClient.get('/v1/admin/accounts', {
        params: {
          keyword: currentKeyword || undefined,
          role: currentRole || undefined,
          status: currentStatus || undefined,
          page: currentPage,
          size: currentSize,
        },
      });
      setAccounts(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (error: any) {
      console.error(error);
      snackbar.error('Lỗi khi tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(page, rowsPerPage, keyword, role, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handleSearchClick = () => {
    setPage(0);
    fetchAccounts(0, rowsPerPage, keyword, role, status);
  };

  const handleClearSearch = () => {
    setKeyword('');
    setRole('');
    setStatus('');
    setPage(0);
    fetchAccounts(0, rowsPerPage, '', '', '');
  };

  const handleToggleLock = async (id: string) => {
    try {
      await axiosClient.put(`/v1/admin/accounts/${id}/toggle-lock`);
      snackbar.success('Cập nhật trạng thái thành công!');
      fetchAccounts(page, rowsPerPage, keyword, role, status);
    } catch {
      snackbar.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleCreateStaff = async () => {
    if (!newStaff.username || !newStaff.email || !newStaff.password) {
      snackbar.error('Lỗi: Vui lòng nhập đủ thông tin!');
      return;
    }
    if (!validatePassword(newStaff.password)) {
      snackbar.error(
        'Mật khẩu phải từ 8-50 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.'
      );
      return;
    }
    setCreating(true);
    try {
      await axiosClient.post('/v1/admin/accounts/staff', newStaff);
      snackbar.success('Tạo tài khoản Staff thành công!');
      setOpenCreateModal(false);
      setNewStaff({ username: '', email: '', password: '' });
      fetchAccounts(0, rowsPerPage, keyword, role, status);
      setPage(0);
    } catch (error: any) {
      console.error(error);
      snackbar.error(error?.message || 'Lỗi khi tạo Staff');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Quản lý tài khoản (identity management)
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Quản lý quyền truy cập, danh tính và tài khoản hệ thống.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenCreateModal(true)}
            disableElevation
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,118,255,0.23)',
              },
            }}
          >
            Thêm nhân viên mới
          </Button>
        </Stack>
      </Box>

      {/* Tầng Search (Targeted View) */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 4,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Tra cứu tài khoản:
        </Typography>
        <TextField
          size="small"
          placeholder="Tên đăng nhập hoặc Email..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          sx={{ width: 300 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Vai trò</InputLabel>
          <Select value={role} label="Vai trò" onChange={(e) => setRole(e.target.value)}>
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
            <MenuItem value="STAFF">STAFF</MenuItem>
            <MenuItem value="STUDENT">STUDENT</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select value={status} label="Trạng thái" onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="ACTIVE">Hoạt động</MenuItem>
            <MenuItem value="LOCKED">Đã Khóa</MenuItem>
            <MenuItem value="PENDING_ACTIVATION">Chờ kích hoạt</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleSearchClick}
          disabled={loading}
          sx={{ fontWeight: 'bold' }}
        >
          Tìm kiếm
        </Button>
        {(keyword || role || status) && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearSearch}
            disabled={loading}
            sx={{ fontWeight: 'bold' }}
          >
            Xóa Lọc
          </Button>
        )}
      </Paper>

      {/* Table Lịch Sử / Danh sách */}
      <Paper sx={{ borderRadius: 4, mb: 4, overflow: 'hidden' }}>
        <Typography
          variant="h6"
          sx={{ p: 2.5, fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider' }}
        >
          Danh sách tài khoản hệ thống
        </Typography>

        {loading ? (
          <Box sx={{ p: 3 }}>
            <CustomSkeleton type="table" count={5} />
          </Box>
        ) : accounts.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary' }}>
              Không tìm thấy tài khoản nào phù hợp.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên đăng nhập</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Vai trò</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Đăng nhập lần cuối</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Thao tác Hỗ trợ
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.accountId} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {account.username}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {account.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={account.role}
                        color={
                          account.role === 'ADMIN'
                            ? 'error'
                            : account.role === 'STAFF'
                              ? 'warning'
                              : 'primary'
                        }
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          account.status === 'ACTIVE'
                            ? 'Hoạt động'
                            : account.status === 'LOCKED'
                              ? 'Đã Khóa'
                              : 'Chờ kích hoạt'
                        }
                        color={
                          account.status === 'ACTIVE'
                            ? 'success'
                            : account.status === 'LOCKED'
                              ? 'error'
                              : 'default'
                        }
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {account.lastLogin
                          ? new Date(account.lastLogin).toLocaleString('vi-VN')
                          : 'Chưa đăng nhập'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {account.role === 'STUDENT' && (
                          <IconButton
                            size="small"
                            color="info"
                            title="Xem hồ sơ Sinh viên"
                            onClick={() => handleViewProfile(account.accountId)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          color={account.status === 'ACTIVE' ? 'error' : 'success'}
                          startIcon={account.status === 'ACTIVE' ? <LockIcon /> : <LockOpenIcon />}
                          onClick={() => handleToggleLock(account.accountId)}
                          sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: 110 }}
                        >
                          {account.status === 'ACTIVE' ? 'Khóa TK' : 'Mở Khóa'}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
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
          labelRowsPerPage="Số dòng/trang:"
        />
      </Paper>

      {/* Modal Thêm Staff */}
      <Dialog
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Tạo tài khoản nhân viên (staff)</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Tài khoản mới sẽ có quyền STAFF, cho phép quản lý nội dung ký túc xá nhưng không có
            quyền cấu hình hệ thống.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Tên đăng nhập (Username)"
              fullWidth
              value={newStaff.username}
              onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
              autoFocus
            />
            <TextField
              label="Địa chỉ email"
              type="email"
              fullWidth
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
            />
            <TextField
              label="Mật khẩu khởi tạo"
              type="password"
              fullWidth
              value={newStaff.password}
              onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenCreateModal(false)} sx={{ fontWeight: 'bold' }}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleCreateStaff}
            variant="contained"
            disabled={creating || !newStaff.username || !newStaff.email || !newStaff.password}
            sx={{ fontWeight: 'bold', px: 3, borderRadius: 2 }}
          >
            {creating ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận tạo'}
          </Button>
        </DialogActions>
      </Dialog>

      <StudentProfileModal
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        loading={loadingProfile}
        profile={selectedProfile}
        onOpenEditAcademic={() => setOpenEditAcademicModal(true)}
      />

      {/* Modal Sửa Học vụ */}
      <Dialog
        open={openEditAcademicModal}
        onClose={() => setOpenEditAcademicModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Cập nhật Học vụ</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Thông tin Khoa/Khóa này sẽ được in trực tiếp lên Hợp đồng (Gia hạn) của sinh viên.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Khoa"
              fullWidth
              value={editAcademicForm.faculty}
              onChange={(e) => setEditAcademicForm({ ...editAcademicForm, faculty: e.target.value })}
              placeholder="VD: Công nghệ thông tin"
              autoFocus
            />
            <TextField
              label="Khóa/Niên khóa"
              fullWidth
              value={editAcademicForm.academicYear}
              onChange={(e) => setEditAcademicForm({ ...editAcademicForm, academicYear: e.target.value })}
              placeholder="VD: K26"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenEditAcademicModal(false)} sx={{ fontWeight: 'bold' }}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSaveAcademicInfo}
            variant="contained"
            disabled={savingAcademic || !editAcademicForm.faculty || !editAcademicForm.academicYear}
            sx={{ fontWeight: 'bold', px: 3, borderRadius: 2 }}
          >
            {savingAcademic ? <CircularProgress size={24} color="inherit" /> : 'Lưu cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
