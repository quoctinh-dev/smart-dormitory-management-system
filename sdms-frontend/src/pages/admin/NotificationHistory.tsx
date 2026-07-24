import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
    Box,
    Button,
    Chip,
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
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
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
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                        Lịch sử thông báo hệ thống
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Xem chi tiết lịch sử gửi thông báo và phát sóng (broadcast) thông điệp đến người dùng.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<SendIcon fontSize="small" />}
                    onClick={() => setOpenBroadcast(true)}
                    disableElevation
                    sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                    Gửi thông báo đồng loạt
                </Button>
            </Box>

            {/* Thống kê nhanh */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <Paper
                    variant="outlined"
                    sx={{
                        flex: 1,
                        p: 2.5,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex',
                        }}
                    >
                        <CampaignOutlinedIcon />
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Tổng số thông báo
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {totalElements?.toLocaleString('vi-VN') || 0}
                        </Typography>
                    </Box>
                </Paper>

                <Paper
                    variant="outlined"
                    sx={{
                        flex: 1,
                        p: 2.5,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                            color: 'success.main',
                            display: 'flex',
                        }}
                    >
                        <CheckCircleOutlineIcon />
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Gửi thành công
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {sentCount?.toLocaleString('vi-VN') || 0}
                        </Typography>
                    </Box>
                </Paper>

                <Paper
                    variant="outlined"
                    sx={{
                        flex: 1,
                        p: 2.5,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                            color: 'error.main',
                            display: 'flex',
                        }}
                    >
                        <ErrorOutlineIcon />
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Gửi thất bại
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
                            {failedCount?.toLocaleString('vi-VN') || 0}
                        </Typography>
                    </Box>
                </Paper>
            </Stack>

            {/* Bộ lọc */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', minWidth: 'max-content' }}>
                        <FilterListIcon fontSize="small" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Bộ lọc
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Tìm theo người nhận hoặc mã sự kiện..."
                        value={filter.keyword}
                        onChange={(e) => {
                            setFilter((prev) => ({ ...prev, keyword: e.target.value }));
                            setPage(0);
                        }}
                        sx={{ minWidth: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
                        <InputLabel>Nguồn tạo</InputLabel>
                        <Select
                            label="Nguồn tạo"
                            value={filter.isBroadcast}
                            onChange={(e) => {
                                setFilter((prev) => ({ ...prev, isBroadcast: e.target.value }));
                                setPage(0);
                            }}
                            sx={{ borderRadius: 1.5 }}
                        >
                            <MenuItem value="">Tất cả nguồn</MenuItem>
                            <MenuItem value="BROADCAST">Gửi đồng loạt (Broadcast)</MenuItem>
                            <MenuItem value="SYSTEM">Hệ thống tự động</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
                        <InputLabel>Loại thông báo</InputLabel>
                        <Select
                            label="Loại thông báo"
                            value={filter.type}
                            onChange={(e) => {
                                setFilter((prev) => ({ ...prev, type: e.target.value }));
                                setPage(0);
                            }}
                            sx={{ borderRadius: 1.5 }}
                        >
                            <MenuItem value="">Tất cả loại</MenuItem>
                            <MenuItem value="ANNOUNCEMENT">Thông báo chung</MenuItem>
                            <MenuItem value="SYSTEM">Hệ thống</MenuItem>
                            <MenuItem value="WARNING">Cảnh báo</MenuItem>
                            <MenuItem value="APPLICATION">Đơn đăng ký</MenuItem>
                            <MenuItem value="MAINTENANCE">Báo hỏng</MenuItem>
                            <MenuItem value="PAYMENT">Thanh toán</MenuItem>
                            <MenuItem value="ROOM">Phòng ở</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {/* Bảng dữ liệu */}
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
                {loading ? (
                    <Box p={3}>
                        <CustomSkeleton type="table" count={5} />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Thời gian</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Người nhận</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Kênh nhận</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Mã tham chiếu</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Chi tiết lỗi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                            <Typography color="text.secondary" variant="body2">
                                                Không tìm thấy dữ liệu thông báo nào phù hợp.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(row.sentAt).toLocaleString('vi-VN')}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {row.recipient}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={translateChannel(row.channel)}
                                                    size="small"
                                                    variant="outlined"
                                                    color={row.channel === 'EMAIL' ? 'info' : 'primary'}
                                                    sx={{ fontWeight: 500 }}
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
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                                    {row.eventId || '-'}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    color="error.main"
                                                    noWrap
                                                    title={row.errorMessage || undefined}
                                                    sx={{ maxWidth: 220 }}
                                                >
                                                    {row.errorMessage || '-'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {!loading && (
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
                        labelRowsPerPage="Số dòng mỗi trang:"
                        rowsPerPageOptions={[10, 25, 50, 100]}
                    />
                )}
            </Paper>

            {/* Dialog gửi thông báo đồng loạt (Đã fix lỗi hiển thị dọc) */}
            <Dialog
                open={openBroadcast}
                onClose={() => setOpenBroadcast(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 600, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    Gửi thông báo đồng loạt (Broadcast)
                </DialogTitle>
                <DialogContent dividers sx={{ py: 2.5 }}>
                    <Stack direction="column" spacing={2.5} sx={{ width: '100%', mt: 1 }}>
                        <TextField
                            label="Tiêu đề thông báo"
                            fullWidth
                            size="small"
                            value={broadcastForm.title}
                            onChange={(event) =>
                                setBroadcastForm((prev) => ({ ...prev, title: event.target.value }))
                            }
                            placeholder="Nhập tiêu đề..."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        />

                        <FormControl fullWidth size="small">
                            <InputLabel>Loại thông báo</InputLabel>
                            <Select
                                label="Loại thông báo"
                                value={broadcastForm.type}
                                onChange={(event) =>
                                    setBroadcastForm((prev) => ({ ...prev, type: event.target.value }))
                                }
                                sx={{ borderRadius: 1.5 }}
                            >
                                <MenuItem value="ANNOUNCEMENT">Thông báo chung</MenuItem>
                                <MenuItem value="SYSTEM">Tin nhắn từ hệ thống</MenuItem>
                                <MenuItem value="WARNING">Cảnh báo an ninh / nội quy</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel>Đối tượng nhận</InputLabel>
                            <Select
                                label="Đối tượng nhận"
                                value={broadcastForm.targetAudience}
                                onChange={(event) =>
                                    setBroadcastForm((prev) => ({ ...prev, targetAudience: event.target.value }))
                                }
                                sx={{ borderRadius: 1.5 }}
                            >
                                <MenuItem value="ALL">Gửi đến tất cả mọi người</MenuItem>
                                <MenuItem value="STUDENT">Chỉ gửi cho sinh viên</MenuItem>
                                <MenuItem value="STAFF">Chỉ gửi cho nhân viên</MenuItem>
                                <MenuItem value="ADMIN">Chỉ gửi cho quản trị viên</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Nội dung thông điệp"
                            fullWidth
                            multiline
                            rows={4}
                            value={broadcastForm.message}
                            onChange={(event) =>
                                setBroadcastForm((prev) => ({ ...prev, message: event.target.value }))
                            }
                            placeholder="Nhập nội dung cần truyền đạt..."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={() => setOpenBroadcast(false)}
                        color="inherit"
                        sx={{ borderRadius: 1.5, textTransform: 'none', color: 'text.secondary' }}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={handleBroadcastSubmit}
                        variant="contained"
                        disableElevation
                        disabled={broadcasting || !broadcastForm.title || !broadcastForm.message}
                        sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 3 }}
                    >
                        {broadcasting ? 'Đang gửi đi...' : 'Phát sóng ngay'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}