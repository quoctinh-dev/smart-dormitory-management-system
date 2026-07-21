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
        {/* HEADER TRANG */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Quản lý tài khoản (Identity Management)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Quản lý quyền truy cập, danh tính và tài khoản hệ thống.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
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
          </Stack>
        </Box>

        {/* TẦNG SEARCH & LỌC */}
        <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Tra cứu:
          </Typography>
          <TextField
              size="small"
              placeholder="Tên đăng nhập hoặc Email..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              sx={{ width: { xs: '100%', sm: 260 }, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
          <FormControl size="small" sx={{ minWidth: 150, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel>Vai trò</InputLabel>
            <Select
                value={role}
                label="Vai trò"
                onChange={(e) => setRole(e.target.value)}
                sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="STAFF">STAFF</MenuItem>
              <MenuItem value="STUDENT">STUDENT</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
                value={status}
                label="Trạng thái"
                onChange={(e) => setStatus(e.target.value)}
                sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="ACTIVE">Hoạt động</MenuItem>
              <MenuItem value="LOCKED">Đã Khóa</MenuItem>
              <MenuItem value="PENDING_ACTIVATION">Chờ kích hoạt</MenuItem>
            </Select>
          </FormControl>
          <Button
              variant="contained"
              disableElevation
              startIcon={<SearchIcon fontSize="small" />}
              onClick={handleSearchClick}
              disabled={loading}
              sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 1.5 }}
          >
            Tìm kiếm
          </Button>
          {(keyword || role || status) && (
              <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleClearSearch}
                  disabled={loading}
                  sx={{ fontWeight: 500, textTransform: 'none', borderRadius: 1.5, color: 'text.secondary' }}
              >
                Xóa lọc
              </Button>
          )}
        </Paper>

        {/* TABLE DANH SÁCH TÀI KHOẢN */}
        <Paper variant="outlined" sx={{ borderRadius: 2, mb: 4, overflow: 'hidden' }}>
          <Typography
              variant="subtitle1"
              sx={{ p: 2.5, fontWeight: 600, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            Danh sách tài khoản hệ thống
          </Typography>

          {loading ? (
              <Box sx={{ p: 3 }}>
                <CustomSkeleton type="table" count={5} />
              </Box>
          ) : accounts.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  Không tìm thấy tài khoản nào phù hợp.
                </Typography>
              </Box>
          ) : (
              <TableContainer>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tên đăng nhập</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Vai trò</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Đăng nhập lần cuối</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accounts.map((account) => (
                        <TableRow key={account.accountId} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {account.username}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
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
                                sx={{ fontWeight: 600, borderRadius: 1 }}
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
                                variant={account.status === 'ACTIVE' ? 'filled' : 'outlined'}
                                sx={{ fontWeight: 600, borderRadius: 1 }}
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
                              <Button
                                  variant="outlined"
                                  size="small"
                                  color={account.status === 'ACTIVE' ? 'error' : 'success'}
                                  startIcon={account.status === 'ACTIVE' ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                                  onClick={() => handleToggleLock(account.accountId)}
                                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, minWidth: 100 }}
                              >
                                {account.status === 'ACTIVE' ? 'Khóa TK' : 'Mở khóa'}
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
              labelRowsPerPage="Số dòng mỗi trang:"
              sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        </Paper>

        {/* MODAL THÊM STAFF */}
        <Dialog
            open={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Tạo tài khoản nhân viên (Staff)</DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Tài khoản mới sẽ có quyền STAFF, cho phép quản lý nội dung ký túc xá nhưng không có
              quyền cấu hình hệ thống.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                  label="Tên đăng nhập (Username)"
                  fullWidth
                  size="small"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                  autoFocus
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
              <TextField
                  label="Địa chỉ email"
                  type="email"
                  fullWidth
                  size="small"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
              <TextField
                  label="Mật khẩu khởi tạo"
                  type="password"
                  fullWidth
                  size="small"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
                onClick={() => setOpenCreateModal(false)}
                color="inherit"
                sx={{ fontWeight: 500, textTransform: 'none', borderRadius: 1.5, color: 'text.secondary' }}
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