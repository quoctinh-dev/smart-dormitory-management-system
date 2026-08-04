import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
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
  Tooltip,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';

import axiosClient from '@/api/axios-client';
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
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
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header trang */}
        <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              mb: 3,
            }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Quản lý tài khoản
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý quyền truy cập, danh tính và phân quyền tài khoản trên hệ thống.
            </Typography>
          </Box>

          <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon fontSize="small" />}
              onClick={() => setOpenCreateModal(true)}
              disableElevation
              sx={{
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
              }}
          >
            Thêm nhân viên mới
          </Button>
        </Box>

        {/* Thanh bộ lọc & Tìm kiếm */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
                size="small"
                placeholder="Tên đăng nhập hoặc Email..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyPress}
                sx={{ minWidth: { xs: '100%', sm: 260 } }}
                slotProps={{
                  input: {
                    startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                    ),
                  },
                }}
            />

            <FormControl size="small" sx={{ minWidth: 160, width: { xs: '100%', sm: 'auto' } }}>
              <InputLabel>Vai trò</InputLabel>
              <Select
                  value={role}
                  label="Vai trò"
                  onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="">Tất cả vai trò</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="STAFF">STAFF</MenuItem>
                <MenuItem value="STUDENT">STUDENT</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160, width: { xs: '100%', sm: 'auto' } }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                  value={status}
                  label="Trạng thái"
                  onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="">Tất cả trạng thái</MenuItem>
                <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                <MenuItem value="LOCKED">Đã Khóa</MenuItem>
                <MenuItem value="PENDING_ACTIVATION">Chờ kích hoạt</MenuItem>
              </Select>
            </FormControl>

            <Button
                variant="contained"
                disableElevation
                onClick={handleSearchClick}
                disabled={loading}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  height: 40,
                  px: 3,
                  width: { xs: '100%', sm: 'auto' },
                }}
            >
              Tìm kiếm
            </Button>

            {(keyword || role || status) && (
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleClearSearch}
                    disabled={loading}
                    sx={{
                      fontWeight: 500,
                      textTransform: 'none',
                      borderRadius: 1.5,
                      height: 40,
                      color: 'text.secondary',
                      width: { xs: '100%', sm: 'auto' },
                    }}
                >
                  Xóa lọc
                </Button>
            )}
          </Stack>
        </Paper>

        {/* Bảng danh sách tài khoản */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tên đăng nhập</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vai trò</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Đăng nhập lần cuối</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 4 }}>
                        <CustomSkeleton type="table" count={5} />
                      </TableCell>
                    </TableRow>
                ) : accounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary" variant="body2">
                          Không tìm thấy tài khoản nào phù hợp.
                        </Typography>
                      </TableCell>
                    </TableRow>
                ) : (
                    accounts.map((account) => (
                        <TableRow key={account.accountId} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {account.username}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" color="text.secondary" fontFamily="monospace">
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
                                sx={{ fontWeight: 600, borderRadius: 1.5 }}
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                                label={
                                  account.status === 'ACTIVE'
                                      ? 'Hoạt động'
                                      : account.status === 'LOCKED'
                                          ? 'Đã khóa'
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
                                sx={{ fontWeight: 600, borderRadius: 1.5 }}
                            />
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {account.lastLogin
                                  ? new Date(account.lastLogin).toLocaleString('vi-VN')
                                  : 'Chưa đăng nhập'}
                            </Typography>
                          </TableCell>

                          {/* Cột thao tác dạng Icon Button tinh gọn */}
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                              {account.status === 'ACTIVE' ? (
                                  <Tooltip title="Khóa tài khoản" arrow placement="top">
                                    <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() => handleToggleLock(account.accountId)}
                                        sx={{
                                          bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                          '&:hover': {
                                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.2),
                                          },
                                        }}
                                    >
                                      <LockIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                              ) : (
                                  <Tooltip title="Mở khóa tài khoản" arrow placement="top">
                                    <IconButton
                                        color="success"
                                        size="small"
                                        onClick={() => handleToggleLock(account.accountId)}
                                        sx={{
                                          bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                                          '&:hover': {
                                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.2),
                                          },
                                        }}
                                    >
                                      <LockOpenIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                    ))
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

        {/* Modal tạo tài khoản nhân viên */}
        <Dialog
            open={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
            Tạo tài khoản nhân viên (Staff)
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Tài khoản mới sẽ có quyền STAFF, cho phép quản lý các tác vụ vận hành KTX.
            </Typography>
            <Stack spacing={2} pt={0.5}>
              <TextField
                  label="Tên đăng nhập (Username)"
                  fullWidth
                  size="small"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                  autoFocus
              />
              <TextField
                  label="Địa chỉ email"
                  type="email"
                  fullWidth
                  size="small"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              />
              <TextField
                  label="Mật khẩu khởi tạo"
                  type="password"
                  fullWidth
                  size="small"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
                onClick={() => setOpenCreateModal(false)}
                color="inherit"
                sx={{ fontWeight: 500, textTransform: 'none', borderRadius: 1.5 }}
            >
              Hủy bỏ
            </Button>
            <Button
                onClick={handleCreateStaff}
                variant="contained"
                disableElevation
                disabled={creating || !newStaff.username || !newStaff.email || !newStaff.password}
                sx={{ fontWeight: 600, textTransform: 'none', px: 3, borderRadius: 1.5 }}
            >
              {creating ? <CircularProgress size={20} color="inherit" /> : 'Xác nhận tạo'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}