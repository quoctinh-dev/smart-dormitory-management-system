import {
    Search,
    FilterList,
    Check,
    Close,
    Visibility,
} from '@mui/icons-material';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    TablePagination,
    InputAdornment,
    Stack,
    IconButton,
    Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useState, useMemo } from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useChangeRoomManagement } from '@/hooks/useChangeRoomManagement';
import { ChangeRoomRequestStatus } from '@/types/change-room';

export default function ChangeRoomManagementPage() {
    const {
        requests,
        loading,
        selectedRequest,
        processDialogOpen,
        setProcessDialogOpen,
        processData,
        setProcessData,
        availableBeds,
        loadingBeds,
        handleProcessOpen,
        handleProcessSubmit,
    } = useChangeRoomManagement();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filter states
    const [filterKeyword, setFilterKeyword] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Apply filters
    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const matchKeyword =
                (req.currentRoomName || '').toLowerCase().includes(filterKeyword.toLowerCase()) ||
                (req.targetRoomName || '').toLowerCase().includes(filterKeyword.toLowerCase()) ||
                (req.studentCode || '').toLowerCase().includes(filterKeyword.toLowerCase()) ||
                (req.studentName || '').toLowerCase().includes(filterKeyword.toLowerCase());

            const matchStatus = filterStatus === 'ALL' || req.status === filterStatus;

            return matchKeyword && matchStatus;
        });
    }, [requests, filterKeyword, filterStatus]);

    const paginatedRequests = filteredRequests.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const renderStatus = (status: ChangeRoomRequestStatus) => {
        switch (status) {
            case 'PENDING':
                return (
                    <Chip
                        label="Đang chờ"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                );
            case 'APPROVED':
                return (
                    <Chip
                        label="Đã duyệt"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                );
            case 'REJECTED':
                return (
                    <Chip
                        label="Từ chối"
                        color="error"
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                );
            default:
                return (
                    <Chip
                        label={status}
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                );
        }
    };

    if (loading && requests.length === 0) {
        return (
            <Box sx={{ py: 3 }}>
                <CustomSkeleton type="table" count={5} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header trang */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                    Quản lý đơn đổi phòng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Cấu hình và duyệt yêu cầu chuyển đổi phòng ở của sinh viên trong học kỳ.
                </Typography>
            </Box>

            {/* Thanh bộ lọc */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
                    <TextField
                        size="small"
                        placeholder="Tìm theo phòng hoặc MSSV..."
                        value={filterKeyword}
                        onChange={(e) => {
                            setFilterKeyword(e.target.value);
                            setPage(0);
                        }}
                        sx={{ minWidth: { xs: '100%', sm: 280 } }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 180, width: { xs: '100%', sm: 'auto' } }}>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            label="Trạng thái"
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                            <MenuItem value="PENDING">Đang chờ xử lý</MenuItem>
                            <MenuItem value="APPROVED">Đã chấp nhận</MenuItem>
                            <MenuItem value="REJECTED">Đã từ chối</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {/* Bảng danh sách yêu cầu */}
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 700 }}>
                        <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Ngày gửi</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Sinh viên</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Phòng hiện tại</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Phòng mong muốn</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Lý do</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary" variant="body2">
                                            Không tìm thấy đơn xin đổi phòng nào phù hợp.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRequests.map((req) => (
                                    <TableRow key={req.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {new Date(req.createdAt).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Stack spacing={0.2}>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {req.studentName || 'N/A'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {req.studentCode || 'N/A'}
                                                </Typography>
                                            </Stack>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {req.currentRoomName || 'N/A'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {req.targetRoomName || 'Tự do / Hệ thống xếp'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell
                                            sx={{
                                                maxWidth: 220,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            <Tooltip title={req.reason} arrow placement="top">
                                                <Typography variant="body2" color="text.secondary">
                                                    {req.reason}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>

                                        <TableCell>{renderStatus(req.status)}</TableCell>

                                        {/* Cột thao tác tối ưu dạng Icon Buttons */}
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                                                {req.status === 'PENDING' ? (
                                                    <>
                                                        <Tooltip title="Duyệt đơn" arrow placement="top">
                                                            <IconButton
                                                                color="success"
                                                                size="small"
                                                                onClick={() => handleProcessOpen(req, true)}
                                                                sx={{
                                                                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                                                                    '&:hover': {
                                                                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.2),
                                                                    },
                                                                }}
                                                            >
                                                                <Check fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title="Từ chối đơn" arrow placement="top">
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() => handleProcessOpen(req, false)}
                                                                sx={{
                                                                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                                                    '&:hover': {
                                                                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.2),
                                                                    },
                                                                }}
                                                            >
                                                                <Close fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                ) : (
                                                    <Tooltip title="Đã xử lý" arrow placement="top">
                            <span>
                              <IconButton size="small" disabled sx={{ color: 'text.disabled' }}>
                                <Visibility fontSize="small" />
                              </IconButton>
                            </span>
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
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredRequests.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="Số dòng mỗi trang:"
                />
            </Paper>

            {/* Dialog xử lý đơn */}
            <Dialog
                open={processDialogOpen}
                onClose={() => setProcessDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
                    {processData.isApproved ? 'Duyệt yêu cầu đổi phòng' : 'Từ chối yêu cầu đổi phòng'}
                </DialogTitle>
                <DialogContent dividers sx={{ py: 2.5 }}>
                    <Stack spacing={2} pt={0.5}>
                        <TextField
                            label="Ghi chú của admin"
                            multiline
                            rows={3}
                            fullWidth
                            size="small"
                            value={processData.adminNote}
                            onChange={(e) => setProcessData({ ...processData, adminNote: e.target.value })}
                        />

                        {processData.isApproved && selectedRequest?.targetRoomId ? (
                            <FormControl fullWidth required size="small" disabled={loadingBeds}>
                                <InputLabel>Giường mới (phòng {selectedRequest.targetRoomName})</InputLabel>
                                <Select
                                    value={processData.newBedId}
                                    label={`Giường mới (phòng ${selectedRequest.targetRoomName})`}
                                    onChange={(e) =>
                                        setProcessData({ ...processData, newBedId: e.target.value as string })
                                    }
                                >
                                    {availableBeds.length === 0 && !loadingBeds && (
                                        <MenuItem value="" disabled>
                                            Không có giường trống
                                        </MenuItem>
                                    )}
                                    {availableBeds.map((bed) => (
                                        <MenuItem key={bed.bedId} value={bed.bedId}>
                                            Giường {bed.bedCode}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : processData.isApproved && !selectedRequest?.targetRoomId ? (
                            <TextField
                                label="ID giường mới (UUID)"
                                fullWidth
                                required
                                size="small"
                                value={processData.newBedId}
                                onChange={(e) => setProcessData({ ...processData, newBedId: e.target.value })}
                                helperText="Sinh viên không chọn phòng đích. Vui lòng nhập ID giường trực tiếp."
                            />
                        ) : null}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={() => setProcessDialogOpen(false)}
                        color="inherit"
                        sx={{ borderRadius: 1.5, textTransform: 'none' }}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="contained"
                        disableElevation
                        color={processData.isApproved ? 'success' : 'error'}
                        onClick={handleProcessSubmit}
                        sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 3 }}
                    >
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}