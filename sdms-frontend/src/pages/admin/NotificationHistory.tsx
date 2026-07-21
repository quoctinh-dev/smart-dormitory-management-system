import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useNotificationHistory } from '@/hooks/useNotificationHistory';

const translateChannel = (channel: string) => {
  switch (channel) {
    case 'EMAIL':
      return 'Email';
    case 'IN_APP':
    case 'APP':
      return 'Ứng dụng';
    case 'SMS':
      return 'SMS';
    default:
      return channel;
  }
};

const translateStatus = (status: string) => {
  switch (status) {
    case 'SENT':
      return 'Thành công';
    case 'FAILED':
      return 'Thất bại';
    case 'PENDING':
      return 'Đang chờ';
    default:
      return status;
  }
};

export default function NotificationHistory() {
  const {
    logs,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalElements,
    openBroadcast,
    setOpenBroadcast,
    broadcastForm,
    setBroadcastForm,
    broadcasting,
    filter,
    setFilter,
    handleBroadcastSubmit,
    sentCount,
    failedCount,
  } = useNotificationHistory();

  return (
    <Container sx={{ py: 4 }} maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
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

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <Paper
          sx={{
            flex: 1,
            p: 3,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.15) 100%)',
            border: '1px solid rgba(25, 118, 210, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            backdropFilter: 'blur(4px)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'primary.main', color: 'white', display: 'flex', boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)' }}>
              <CampaignOutlinedIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight="medium" textTransform="uppercase" letterSpacing={1}>
                Tổng bản ghi
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {totalElements || 0}
              </Typography>
            </Box>
          </Stack>
        </Paper>
        
        <Paper
          sx={{
            flex: 1,
            p: 3,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(46, 125, 50, 0.15) 100%)',
            border: '1px solid rgba(46, 125, 50, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            backdropFilter: 'blur(4px)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'success.main', color: 'white', display: 'flex', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)' }}>
              <SendIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight="medium" textTransform="uppercase" letterSpacing={1}>
                Gửi thành công
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {sentCount || 0}
              </Typography>
            </Box>
          </Stack>
        </Paper>
        
        <Paper
          sx={{
            flex: 1,
            p: 3,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.05) 0%, rgba(211, 47, 47, 0.15) 100%)',
            border: '1px solid rgba(211, 47, 47, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            backdropFilter: 'blur(4px)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'error.main', color: 'white', display: 'flex', boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)' }}>
              <CampaignOutlinedIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight="medium" textTransform="uppercase" letterSpacing={1}>
                Gửi thất bại
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {failedCount || 0}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2, color: 'text.secondary' }}>
          <FilterListIcon fontSize="small" />
          <Typography variant="body2" fontWeight="bold">
            Bộ lọc
          </Typography>
        </Box>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Tìm kiếm người nhận / Mã sự kiện"
          value={filter.keyword}
          onChange={(e) => {
            setFilter((prev) => ({ ...prev, keyword: e.target.value }));
            setPage(0);
          }}
          sx={{ width: { xs: '100%', sm: 300 }, bgcolor: '#ffffff', borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl
          size="small"
          variant="outlined"
          sx={{ width: { xs: '100%', sm: 200 }, bgcolor: '#ffffff', borderRadius: 1 }}
        >
          <InputLabel>Nguồn tạo</InputLabel>
          <Select
            label="Nguồn tạo"
            value={filter.isBroadcast}
            onChange={(e) => {
              setFilter((prev) => ({ ...prev, isBroadcast: e.target.value }));
              setPage(0);
            }}
          >
          <MenuItem value="">Tất cả nguồn</MenuItem>
          <MenuItem value="BROADCAST">Admin gửi Broadcast</MenuItem>
          <MenuItem value="SYSTEM">Hệ thống tự động gửi</MenuItem>
          </Select>
        </FormControl>
        <FormControl
          size="small"
          variant="outlined"
          sx={{ width: { xs: '100%', sm: 200 }, bgcolor: '#ffffff', borderRadius: 1 }}
        >
          <InputLabel>Loại thông báo</InputLabel>
          <Select
            label="Loại thông báo"
            value={filter.type}
            onChange={(e) => {
              setFilter((prev) => ({ ...prev, type: e.target.value }));
              setPage(0);
            }}
          >
          <MenuItem value="">Tất cả loại</MenuItem>
          <MenuItem value="ANNOUNCEMENT">Thông báo chung</MenuItem>
          <MenuItem value="SYSTEM">Hệ thống</MenuItem>
          <MenuItem value="WARNING">Cảnh báo</MenuItem>
          <MenuItem value="APPLICATION">Đơn đăng ký</MenuItem>
          <MenuItem value="MAINTENANCE">Báo hỏng</MenuItem>
          <MenuItem value="PAYMENT">Thanh toán</MenuItem>
          <MenuItem value="ROOM">Đổi phòng/Phòng ở</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {loading ? (
          <Box p={3}>
            <CustomSkeleton type="table" count={5} />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Người nhận</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Kênh</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mã sự kiện</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Chi tiết lỗi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Không có dữ liệu.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {new Date(row.sentAt).toLocaleString('vi-VN')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {row.recipient}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={translateChannel(row.channel)}
                          size="small"
                          color={row.channel === 'EMAIL' ? 'info' : 'primary'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={translateStatus(row.status)}
                          size="small"
                          color={
                            row.status === 'SENT'
                              ? 'success'
                              : row.status === 'FAILED'
                                ? 'error'
                                : 'warning'
                          }
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                          {row.eventId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: 'error.main', fontSize: '0.85rem', maxWidth: 200 }} noWrap title={row.errorMessage || undefined}>
                          {row.errorMessage || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalElements || 0}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Số dòng/trang:"
            />
          </>
        )}
      </TableContainer>

      <Dialog open={openBroadcast} onClose={() => setOpenBroadcast(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', pb: 1 }}>Gửi thông báo Broadcast</DialogTitle>
        <DialogContent dividers>
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
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setOpenBroadcast(false)} sx={{ borderRadius: 2 }}>Hủy</Button>
          <Button
            onClick={handleBroadcastSubmit}
            variant="contained"
            disabled={broadcasting || !broadcastForm.title || !broadcastForm.message}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {broadcasting ? 'Đang gửi...' : 'Phát sóng'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
