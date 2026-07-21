import {CheckCircle, Cancel} from '@mui/icons-material';
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
} from '@mui/material';
import {alpha} from '@mui/material/styles';
import React from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import {useCheckoutManagement} from '@/hooks/useCheckoutManagement';
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
        openReview,
        setOpenReview,
        selectedRequest,
        reviewStatus,
        rejectReason,
        setRejectReason,
        submitting,
        handleOpenReview,
        handleReviewSubmit,
    } = useCheckoutManagement();

    const handleExportCSV = () => {
        // 1. Lọc ra những người có số tài khoản và ở trạng thái APPROVED
        const exportData = requests.filter(req => req.status === 'APPROVED' && req.bankAccountNumber);

        if (exportData.length === 0) {
            snackbar.warning('Không có đơn nào Đã duyệt và có thông tin Ngân hàng để xuất!');
            return;
        }

        // 2. Tạo header CSV
        const headers = ['Mã SV', 'Họ Tên', 'Phòng', 'Giường', 'Ngân Hàng', 'Số Tài Khoản', 'Ngày Trả Phòng'];

        // 3. Tạo row data
        const rows = exportData.map(req => [
            req.studentCode,
            req.fullName,
            req.roomCode,
            req.bedCode,
            req.bankName,
            req.bankAccountNumber,
            new Date(req.intendedCheckoutDate).toLocaleDateString('vi-VN')
        ]);

        // 4. Gộp thành string CSV
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(item => `"${item || ''}"`).join(','))
        ].join('\n');

        // 5. Thêm BOM để Excel đọc được tiếng Việt có dấu
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], {type: 'text/csv;charset=utf-8;'});

        // 6. Tạo thẻ <a> để download
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `DanhSach_HoanTien_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box sx={{p: {xs: 2, md: 3}}}>
            {/* Header trang */}
            <Box sx={{
                mb: 3,
                display: 'flex',
                flexDirection: {xs: 'column', md: 'row'},
                justifyContent: 'space-between',
                alignItems: {xs: 'flex-start', md: 'center'},
                gap: 2
            }}>
                <Box>
                    <Typography variant="h5" sx={{fontWeight: 600, color: 'text.primary', mb: 0.5}}>
                        Quản lý trả phòng & Hoàn tiền
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Duyệt yêu cầu trả phòng (Checkout) và xuất báo cáo chốt công nợ gửi Phòng Tài Vụ giải ngân.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<DownloadIcon fontSize="small"/>}
                    sx={{borderRadius: 1.5, fontWeight: 600, textTransform: 'none'}}
                    onClick={handleExportCSV}
                >
                    Xuất Báo cáo Tài Vụ
                </Button>
            </Box>

            {/* Bộ lọc */}
            <Paper variant="outlined" sx={{p: 2, mb: 3, borderRadius: 2}}>
                <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems="center">
                    <Typography variant="body2"
                                sx={{fontWeight: 600, color: 'text.secondary', minWidth: 'max-content'}}>
                        Bộ lọc danh sách
                    </Typography>

                    <FormControl size="small" sx={{minWidth: 240, width: {xs: '100%', sm: 'auto'}}}>
                        <InputLabel>Trạng thái yêu cầu</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Trạng thái yêu cầu"
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                            sx={{borderRadius: 1.5}}
                        >
                            <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                            <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                            <MenuItem value="APPROVED">Đã duyệt (Chờ hoàn tiền)</MenuItem>
                            <MenuItem value="COMPLETED">Đã hoàn tất (Đã hoàn tiền)</MenuItem>
                            <MenuItem value="REJECTED">Bị từ chối</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {/* Bảng dữ liệu */}
            <Paper variant="outlined" sx={{borderRadius: 2, overflow: 'hidden', mb: 4}}>
                {loading ? (
                    <Box p={3}>
                        <CustomSkeleton type="table" count={5}/>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table sx={{minWidth: 800}}>
                            <TableHead sx={{bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05)}}>
                                <TableRow>
                                    <TableCell sx={{fontWeight: 600}}>Thông tin sinh viên</TableCell>
                                    <TableCell sx={{fontWeight: 600}}>Vị trí phòng/giường</TableCell>
                                    <TableCell sx={{fontWeight: 600}}>Ngày hẹn Checkout</TableCell>
                                    <TableCell sx={{fontWeight: 600}}>Tài khoản nhận hoàn tiền</TableCell>
                                    <TableCell sx={{fontWeight: 600}}>Trạng thái</TableCell>
                                    <TableCell align="center" sx={{fontWeight: 600}}>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{py: 6}}>
                                            <Typography color="text.secondary" variant="body2">
                                                Không có yêu cầu trả phòng nào phù hợp với bộ lọc.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.map((row) => {
                                        const isApproved = row.status === 'APPROVED';
                                        const isRejected = row.status === 'REJECTED';
                                        const isCompleted = row.status === 'COMPLETED';
                                        return (
                                            <TableRow key={row.requestId} hover>
                                                <TableCell>
                                                    <Typography variant="body2"
                                                                sx={{fontWeight: 600, color: 'text.primary'}}>
                                                        {row.fullName}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{
                                                        color: 'text.secondary',
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        {row.studentCode}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography variant="body2" sx={{fontWeight: 500}}>
                                                        Phòng {row.roomCode}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{color: 'text.secondary'}}>
                                                        Giường {row.bedCode}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography variant="body2"
                                                                sx={{fontWeight: 600, color: 'error.main'}}>
                                                        {new Date(row.intendedCheckoutDate).toLocaleDateString('vi-VN')}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    {row.bankAccountNumber ? (
                                                        <>
                                                            <Typography variant="body2" sx={{fontWeight: 500}} noWrap
                                                                        title={row.bankName}>
                                                                {row.bankName}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{
                                                                color: 'text.secondary',
                                                                fontFamily: 'monospace',
                                                                fontSize: '0.8rem'
                                                            }}>
                                                                {row.bankAccountNumber}
                                                            </Typography>
                                                        </>
                                                    ) : (
                                                        <Typography variant="body2"
                                                                    sx={{color: 'text.disabled', fontStyle: 'italic'}}>
                                                            Chưa cập nhật
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                {/* CỘT TRẠNG THÁI: Tích hợp icon chấm than (Info) nếu bị từ chối */}
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <Chip
                                                            label={isCompleted ? 'Đã hoàn tất' : isApproved ? 'Đã duyệt' : isRejected ? 'Từ chối' : 'Chờ xử lý'}
                                                            size="small"
                                                            variant={isApproved || isCompleted ? 'filled' : 'outlined'}
                                                            color={isCompleted ? 'info' : isApproved ? 'success' : isRejected ? 'error' : 'warning'}
                                                            sx={{fontWeight: 600, borderRadius: 1}}
                                                        />
                                                        {isRejected && row.rejectReason && (
                                                            <Tooltip title={row.rejectReason}>
                                                                <IconButton size="small" color="error" sx={{p: 0.5}}>
                                                                    <InfoOutlinedIcon fontSize="small"/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Stack>
                                                </TableCell>

                                                <TableCell align="center">
                                                    {row.status === 'PENDING' && (
                                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                                            <Tooltip title="Duyệt yêu cầu & Chốt công nợ">
                                                                <IconButton
                                                                    color="success"
                                                                    size="small"
                                                                    onClick={() => handleOpenReview(row, 'APPROVED')}
                                                                >
                                                                    <CheckCircle fontSize="small"/>
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Từ chối yêu cầu">
                                                                <IconButton
                                                                    color="error"
                                                                    size="small"
                                                                    onClick={() => handleOpenReview(row, 'REJECTED')}
                                                                >
                                                                    <Cancel fontSize="small"/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    )}
                                                    {row.status === 'APPROVED' && (
                                                        <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                                            <Tooltip title="Xác nhận đã giải ngân qua Tài Vụ">
                                                                <Button
                                                                    variant="contained"
                                                                    color="info"
                                                                    size="small"
                                                                    disableElevation
                                                                    onClick={() => handleOpenReview(row, 'COMPLETED')}
                                                                    sx={{
                                                                        textTransform: 'none',
                                                                        fontWeight: 600,
                                                                        borderRadius: 1.5,
                                                                        py: 0.5
                                                                    }}
                                                                >
                                                                    Hoàn tất
                                                                </Button>
                                                            </Tooltip>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
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

            {/* Dialog xử lý yêu cầu */}
            <Dialog
                open={openReview}
                onClose={() => setOpenReview(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{sx: {borderRadius: 2}}}
            >
                <DialogTitle sx={{fontWeight: 600, pb: 1}}>
                    {reviewStatus === 'APPROVED'
                        ? 'Xác nhận duyệt trả phòng'
                        : reviewStatus === 'COMPLETED'
                            ? 'Xác nhận hoàn tất quy trình'
                            : 'Xác nhận từ chối trả phòng'}
                </DialogTitle>
                <DialogContent dividers sx={{py: 2}}>
                    <Typography variant="body2" sx={{mb: 2, color: 'text.primary'}}>
                        Bạn đang thao tác với yêu cầu trả phòng của sinh viên <Box component="span"
                                                                                   sx={{fontWeight: 600}}>{selectedRequest?.fullName}</Box>.
                    </Typography>

                    {reviewStatus === 'APPROVED' && (
                        <Alert severity="warning" sx={{mt: 2, borderRadius: 1.5}}>
                            <strong>Lưu ý quan trọng:</strong> Sau khi duyệt, sinh viên sẽ bị Checkout khỏi phòng trên
                            hệ thống ngay lập tức. Các quyền ra vào (FaceID, Thẻ) sẽ bị thu hồi tự động. Hệ thống sẽ tự
                            động chốt công nợ để chuẩn bị dữ liệu gửi Phòng Tài Vụ.
                        </Alert>
                    )}

                    {reviewStatus === 'COMPLETED' && (
                        <Alert severity="info" sx={{mt: 2, borderRadius: 1.5}}>
                            Xác nhận hồ sơ này đã được giải ngân thành công từ Phòng Tài Vụ, hoặc sinh viên đã nhận được
                            tiền hoàn lại. Yêu cầu này sẽ được chuyển vào trạng thái lưu trữ (Hoàn tất).
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
                            sx={{mt: 1, '& .MuiOutlinedInput-root': {borderRadius: 1.5}}}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{px: 3, py: 2}}>
                    <Button
                        onClick={() => setOpenReview(false)}
                        color="inherit"
                        disabled={submitting}
                        sx={{borderRadius: 1.5, textTransform: 'none', fontWeight: 500}}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={handleReviewSubmit}
                        variant="contained"
                        disableElevation
                        color={reviewStatus === 'APPROVED' ? 'success' : reviewStatus === 'COMPLETED' ? 'info' : 'error'}
                        disabled={submitting || (reviewStatus === 'REJECTED' && !rejectReason.trim())}
                        sx={{borderRadius: 1.5, px: 3, textTransform: 'none', fontWeight: 600}}
                    >
                        {submitting ? 'Đang xử lý...' : 'Xác nhận'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}