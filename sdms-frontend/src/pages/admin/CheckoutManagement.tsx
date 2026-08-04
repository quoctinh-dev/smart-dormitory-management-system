import { CheckCircle, Cancel, ChecklistRtl } from '@mui/icons-material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Tooltip,
    Stack,
    Checkbox,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useCheckoutManagement } from '@/hooks/useCheckoutManagement';
import { snackbar } from '@/helpers/snackbar';

export default function CheckoutManagement() {
    const {
        requests,
        loading,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        totalElements,
        statusFilter,
        setStatusFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        selectedRequestIds,
        setSelectedRequestIds,
        openReview,
        setOpenReview,
        selectedRequest,
        reviewStatus,
        rejectReason,
        setRejectReason,
        submitting,
        handleOpenReview,
        handleReviewSubmit,
        handleBulkReviewSubmit,
    } = useCheckoutManagement();

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedRequestIds(requests.map((r) => r.requestId));
        } else {
            setSelectedRequestIds([]);
        }
    };

    const handleSelectRow = (requestId: string) => {
        const selectedIndex = selectedRequestIds.indexOf(requestId);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedRequestIds, requestId);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedRequestIds.slice(1));
        } else if (selectedIndex === selectedRequestIds.length - 1) {
            newSelected = newSelected.concat(selectedRequestIds.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedRequestIds.slice(0, selectedIndex),
                selectedRequestIds.slice(selectedIndex + 1)
            );
        }
        setSelectedRequestIds(newSelected);
    };

    const handleExportCSV = () => {
        // 1. Lọc ra những đơn có tài khoản ngân hàng và đã duyệt (APPROVED)
        const exportData = requests.filter(
            (req) => req.status === 'APPROVED' && req.bankAccountNumber
        );

        if (exportData.length === 0) {
            snackbar.warning('Không có đơn nào đã duyệt và có thông tin ngân hàng để xuất!');
            return;
        }

        // 2. Tạo header CSV
        const headers = [
            'Mã SV',
            'Họ tên',
            'Phòng',
            'Giường',
            'Ngân hàng',
            'Số tài khoản',
            'Ngày trả phòng',
        ];

        // 3. Tạo dữ liệu các dòng
        const rows = exportData.map((req) => [
            req.studentCode,
            req.fullName,
            req.roomCode,
            req.bedCode,
            req.bankName,
            req.bankAccountNumber,
            new Date(req.intendedCheckoutDate).toLocaleDateString('vi-VN'),
        ]);

        // 4. Gộp thành chuỗi CSV
        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((item) => `"${item || ''}"`).join(',')),
        ].join('\n');

        // 5. Thêm BOM hỗ trợ tiếng Việt có dấu trong Excel
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });

        // 6. Tải xuống file CSV
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            `DanhSach_HoanTien_${new Date().toISOString().split('T')[0]}.csv`
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header trang */}
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2,
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                        Quản lý trả phòng & hoàn tiền
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Duyệt yêu cầu trả phòng (checkout) và xuất báo cáo chốt công nợ gửi phòng Tài vụ giải ngân.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                    {selectedRequestIds.length > 0 && statusFilter === 'APPROVED' && (
                        <Button
                            variant="contained"
                            color="info"
                            disableElevation
                            startIcon={<ChecklistRtl fontSize="small" />}
                            sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none' }}
                            onClick={() => handleBulkReviewSubmit('COMPLETED')}
                        >
                            Hoàn tất ({selectedRequestIds.length})
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<DownloadIcon fontSize="small" />}
                        sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none' }}
                        onClick={handleExportCSV}
                    >
                        Xuất báo cáo tài vụ
                    </Button>
                </Stack>
            </Box>

            {/* Thanh bộ lọc */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
                    <FormControl size="small" sx={{ minWidth: 220, width: { xs: '100%', sm: 'auto' } }}>
                        <InputLabel>Trạng thái yêu cầu</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Trạng thái yêu cầu"
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                            <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                            <MenuItem value="APPROVED">Đã duyệt (chờ hoàn tiền)</MenuItem>
                            <MenuItem value="COMPLETED">Đã hoàn tất (đã hoàn tiền)</MenuItem>
                            <MenuItem value="REJECTED">Bị từ chối</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        type="date"
                        size="small"
                        label="Từ ngày"
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={startDate || ''}
                        onChange={(e) => setStartDate(e.target.value || undefined)}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                    />

                    <TextField
                        type="date"
                        size="small"
                        label="Đến ngày"
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={endDate || ''}
                        onChange={(e) => setEndDate(e.target.value || undefined)}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                    />
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
                        <Table sx={{ minWidth: 850 }}>
                            <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            indeterminate={
                                                selectedRequestIds.length > 0 &&
                                                selectedRequestIds.length < requests.length
                                            }
                                            checked={requests.length > 0 && selectedRequestIds.length === requests.length}
                                            onChange={handleSelectAll}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Thống tin sinh viên</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Phòng / Giường</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Ngày hẹn checkout</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Tài khoản nhận hoàn tiền</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                            <Typography color="text.secondary" variant="body2">
                                                Không tìm thấy yêu cầu trả phòng nào phù hợp với bộ lọc.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.map((row) => {
                                        const isApproved = row.status === 'APPROVED';
                                        const isRejected = row.status === 'REJECTED';
                                        const isCompleted = row.status === 'COMPLETED';
                                        const isSelected = selectedRequestIds.indexOf(row.requestId) !== -1;

                                        return (
                                            <TableRow key={row.requestId} hover selected={isSelected}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        color="primary"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectRow(row.requestId)}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Stack spacing={0.2}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                            {row.fullName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                                            {row.studentCode}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        Phòng {row.roomCode}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Giường {row.bedCode}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                                                        {new Date(row.intendedCheckoutDate).toLocaleDateString('vi-VN')}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    {row.bankAccountNumber ? (
                                                        <Stack spacing={0.2}>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap title={row.bankName}>
                                                                {row.bankName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                                                {row.bankAccountNumber}
                                                            </Typography>
                                                        </Stack>
                                                    ) : (
                                                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                                            Chưa cập nhật
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <Chip
                                                            label={
                                                                isCompleted
                                                                    ? 'Đã hoàn tất'
                                                                    : isApproved
                                                                        ? 'Đã duyệt'
                                                                        : isRejected
                                                                            ? 'Từ chối'
                                                                            : 'Chờ xử lý'
                                                            }
                                                            size="small"
                                                            color={
                                                                isCompleted
                                                                    ? 'info'
                                                                    : isApproved
                                                                        ? 'success'
                                                                        : isRejected
                                                                            ? 'error'
                                                                            : 'warning'
                                                            }
                                                            sx={{ fontWeight: 600, borderRadius: 1.5 }}
                                                        />
                                                        {isRejected && row.rejectReason && (
                                                            <Tooltip title={row.rejectReason} arrow placement="top">
                                                                <IconButton size="small" color="error" sx={{ p: 0.5 }}>
                                                                    <InfoOutlinedIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Stack>
                                                </TableCell>

                                                {/* Cột thao tác tinh gọn dạng Icon Buttons */}
                                                <TableCell align="center">
                                                    <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                                                        {row.status === 'PENDING' && (
                                                            <>
                                                                <Tooltip title="Duyệt yêu cầu & chốt công nợ" arrow placement="top">
                                                                    <IconButton
                                                                        color="success"
                                                                        size="small"
                                                                        onClick={() => handleOpenReview(row, 'APPROVED')}
                                                                        sx={{
                                                                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                                                                            '&:hover': {
                                                                                bgcolor: (theme) => alpha(theme.palette.success.main, 0.2),
                                                                            },
                                                                        }}
                                                                    >
                                                                        <CheckCircle fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>

                                                                <Tooltip title="Từ chối yêu cầu" arrow placement="top">
                                                                    <IconButton
                                                                        color="error"
                                                                        size="small"
                                                                        onClick={() => handleOpenReview(row, 'REJECTED')}
                                                                        sx={{
                                                                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                                                            '&:hover': {
                                                                                bgcolor: (theme) => alpha(theme.palette.error.main, 0.2),
                                                                            },
                                                                        }}
                                                                    >
                                                                        <Cancel fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        )}

                                                        {row.status === 'APPROVED' && (
                                                            <Tooltip title="Xác nhận đã giải ngân qua phòng Tài vụ" arrow placement="top">
                                                                <IconButton
                                                                    color="info"
                                                                    size="small"
                                                                    onClick={() => handleOpenReview(row, 'COMPLETED')}
                                                                    sx={{
                                                                        bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                                                                        '&:hover': {
                                                                            bgcolor: (theme) => alpha(theme.palette.info.main, 0.2),
                                                                        },
                                                                    }}
                                                                >
                                                                    <ChecklistRtl fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Phân trang */}
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

            {/* Dialog xử lý yêu cầu */}
            <Dialog
                open={openReview}
                onClose={() => setOpenReview(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
                    {reviewStatus === 'APPROVED'
                        ? 'Xác nhận duyệt trả phòng'
                        : reviewStatus === 'COMPLETED'
                            ? 'Xác nhận hoàn tất quy trình'
                            : 'Xác nhận từ chối trả phòng'}
                </DialogTitle>
                <DialogContent dividers sx={{ py: 2.5 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                        Bạn đang thao tác với yêu cầu trả phòng của sinh viên{' '}
                        <Box component="span" sx={{ fontWeight: 600 }}>
                            {selectedRequest?.fullName}
                        </Box>
                        .
                    </Typography>

                    {reviewStatus === 'APPROVED' && (
                        <Alert severity="warning" sx={{ mt: 2, borderRadius: 1.5 }}>
                            <strong>Lưu ý quan trọng:</strong> Sau khi duyệt, sinh viên sẽ bị checkout khỏi phòng trên
                            hệ thống ngay lập tức. Các quyền ra vào (FaceID, thẻ) sẽ bị thu hồi tự động. Hệ thống sẽ tự
                            động chốt công nợ để chuẩn bị dữ liệu gửi phòng Tài vụ.
                        </Alert>
                    )}

                    {reviewStatus === 'COMPLETED' && (
                        <Alert severity="info" sx={{ mt: 2, borderRadius: 1.5 }}>
                            Xác nhận hồ sơ này đã được giải ngân thành công từ phòng Tài vụ, hoặc sinh viên đã nhận được
                            tiền hoàn lại. Yêu cầu này sẽ được chuyển vào trạng thái lưu trữ (hoàn tất).
                        </Alert>
                    )}

                    {reviewStatus === 'REJECTED' && (
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Lý do từ chối"
                            placeholder="Nhập lý do chi tiết để thông báo lại cho sinh viên..."
                            fullWidth
                            multiline
                            rows={3}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            required
                            sx={{ mt: 1 }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={() => setOpenReview(false)}
                        color="inherit"
                        disabled={submitting}
                        sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 500 }}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={handleReviewSubmit}
                        variant="contained"
                        disableElevation
                        color={
                            reviewStatus === 'APPROVED'
                                ? 'success'
                                : reviewStatus === 'COMPLETED'
                                    ? 'info'
                                    : 'error'
                        }
                        disabled={submitting || (reviewStatus === 'REJECTED' && !rejectReason.trim())}
                        sx={{ borderRadius: 1.5, px: 3, textTransform: 'none', fontWeight: 600 }}
                    >
                        {submitting ? 'Đang xử lý...' : 'Xác nhận'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}