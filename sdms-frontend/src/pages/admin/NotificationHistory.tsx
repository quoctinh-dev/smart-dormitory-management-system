import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import SendIcon from '@mui/icons-material/Send';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import { notificationApi, NotificationDeliveryLog } from '@/api/notificationApi';
import { snackbar } from '@/utils/snackbar';

export default function NotificationHistory() {
  const [logs, setLogs] = useState<NotificationDeliveryLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [openBroadcast, setOpenBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    targetAudience: 'ALL',
    type: 'ANNOUNCEMENT',
  });
  const [broadcasting, setBroadcasting] = useState(false);

  const [filter, setFilter] = useState({ keyword: '', type: '', isBroadcast: '' });

  const fetchLogs = async (nextPage: number, size: number, currentFilter: typeof filter) => {
    setLoading(true);
    try {
      const typeParam = currentFilter.type === 'ALL' ? undefined : currentFilter.type || undefined;
      const broadcastParam =
        currentFilter.isBroadcast === 'BROADCAST'
          ? true
          : currentFilter.isBroadcast === 'SYSTEM'
            ? false
            : undefined;

      const data = await notificationApi.getDeliveryLogs(
        nextPage,
        size,
        currentFilter.keyword || undefined,
        typeParam,
        broadcastParam
      );
      setLogs(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (requestError) {
      console.error(requestError);
      snackbar.error('Lỗi khi tải lịch sử thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page, rowsPerPage, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filter]);

  const handleBroadcastSubmit = async () => {
    if (!broadcastForm.title || !broadcastForm.message) return;

    setBroadcasting(true);
    try {
      const result = await notificationApi.broadcastNotification(broadcastForm);
      setOpenBroadcast(false);
      setBroadcastForm({ title: '', message: '', targetAudience: 'ALL', type: 'ANNOUNCEMENT' });
      setPage(0);
      snackbar.success(`Da phat thong bao cho ${result.recipientCount} tai khoan.`);
      fetchLogs(0, rowsPerPage, filter);
    } catch (requestError) {
      console.error(requestError);
      snackbar.error('Loi khi gui broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  const sentCount = logs.filter((row) => row.status === 'SENT').length;
  const failedCount = logs.filter((row) => row.status === 'FAILED').length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Lịch sử thông báo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Theo dõi trạng thái gửi và quản lý thông báo broadcast cho hệ thống.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setOpenBroadcast(true)}
          sx={{ borderRadius: 2, px: 2.5 }}
        >
          Gửi thông báo broadcast
        </Button>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Paper
          sx={{ flex: 1, p: 2.25, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <CampaignOutlinedIcon color="primary" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Tổng bản ghi
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {totalElements}
              </Typography>
            </Box>
          </Stack>
        </Paper>
        <Paper
          sx={{ flex: 1, p: 2.25, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <CampaignOutlinedIcon color="success" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Gửi thành công
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {sentCount}
              </Typography>
            </Box>
          </Stack>
        </Paper>
        <Paper
          sx={{ flex: 1, p: 2.25, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <CampaignOutlinedIcon color="error" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Gửi thất bại
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {failedCount}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>


      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            size="small"
            label="Tìm kiếm người nhận hoặc Event ID"
            variant="outlined"
            fullWidth
            value={filter.keyword}
            onChange={(e) => {
              setFilter((prev) => ({ ...prev, keyword: e.target.value }));
              setPage(0);
            }}
          />
          <TextField
            select
            size="small"
            label="Nguồn tạo"
            value={filter.isBroadcast}
            onChange={(e) => {
              setFilter((prev) => ({ ...prev, isBroadcast: e.target.value }));
              setPage(0);
            }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Tất cả nguồn</MenuItem>
            <MenuItem value="BROADCAST">Admin gửi Broadcast</MenuItem>
            <MenuItem value="SYSTEM">Hệ thống tự động gửi</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Loại thông báo"
            value={filter.type}
            onChange={(e) => {
              setFilter((prev) => ({ ...prev, type: e.target.value }));
              setPage(0);
            }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Tất cả loại</MenuItem>
            <MenuItem value="ANNOUNCEMENT">Thông báo chung</MenuItem>
            <MenuItem value="SYSTEM">Hệ thống</MenuItem>
            <MenuItem value="WARNING">Cảnh báo</MenuItem>
            <MenuItem value="APPLICATION">Đơn đăng ký</MenuItem>
            <MenuItem value="MAINTENANCE">Báo hỏng</MenuItem>
            <MenuItem value="PAYMENT">Thanh toán</MenuItem>
            <MenuItem value="ROOM">Đổi phòng/Phòng ở</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      <Paper sx={{ width: '100%', mb: 2, borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Người nhận</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Kênh</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Event ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Chi tiết lỗi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    Chưa có lịch sử thông báo nào.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>{new Date(row.createdAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell>{row.recipient}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.channel}
                        size="small"
                        color={row.channel === 'EMAIL' ? 'info' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={
                          row.status === 'SENT'
                            ? 'success'
                            : row.status === 'FAILED'
                              ? 'error'
                              : 'warning'
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                      {row.eventId}
                    </TableCell>
                    <TableCell sx={{ color: 'error.main', fontSize: '0.85rem' }}>
                      {row.errorMessage || '-'}
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
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="Số dòng/trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} trong ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>

      <Dialog open={openBroadcast} onClose={() => setOpenBroadcast(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Gửi thông báo toàn hệ thống</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tiêu đề"
            fullWidth
            value={broadcastForm.title}
            onChange={(event) =>
              setBroadcastForm((prev) => ({ ...prev, title: event.target.value }))
            }
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            select
            margin="dense"
            label="Loại thông báo"
            fullWidth
            value={broadcastForm.type}
            onChange={(event) =>
              setBroadcastForm((prev) => ({ ...prev, type: event.target.value }))
            }
            sx={{ mb: 2 }}
          >
            <MenuItem value="ANNOUNCEMENT">Thông báo chung</MenuItem>
            <MenuItem value="SYSTEM">Hệ thống</MenuItem>
            <MenuItem value="WARNING">Cảnh báo</MenuItem>
          </TextField>
          <TextField
            select
            margin="dense"
            label="Đối tượng nhận"
            fullWidth
            value={broadcastForm.targetAudience}
            onChange={(event) =>
              setBroadcastForm((prev) => ({ ...prev, targetAudience: event.target.value }))
            }
            sx={{ mb: 2 }}
          >
            <MenuItem value="ALL">Tất cả mọi người</MenuItem>
            <MenuItem value="STUDENT">Chỉ Sinh viên</MenuItem>
            <MenuItem value="STAFF">Chỉ Nhân viên</MenuItem>
            <MenuItem value="ADMIN">Chỉ Admin</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Nội dung"
            fullWidth
            multiline
            rows={4}
            value={broadcastForm.message}
            onChange={(event) =>
              setBroadcastForm((prev) => ({ ...prev, message: event.target.value }))
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenBroadcast(false)}>Hủy</Button>
          <Button
            onClick={handleBroadcastSubmit}
            variant="contained"
            disabled={broadcasting || !broadcastForm.title || !broadcastForm.message}
          >
            {broadcasting ? 'Đang gửi...' : 'Phát sóng'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
