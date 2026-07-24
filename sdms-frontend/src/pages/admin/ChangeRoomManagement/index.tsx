import { Search, FilterList } from '@mui/icons-material';
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

    const paginatedRequests = filteredRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const renderStatus = (status: ChangeRoomRequestStatus) => {
        switch (status) {
            case 'PENDING':
                return <Chip label="Đang chờ" color="warning" size="small" sx={{ fontWeight: 600, borderRadius: 1 }} />;
            case 'APPROVED':
                return <Chip label="Đã duyệt" color="success" size="small" sx={{ fontWeight: 600, borderRadius: 1 }} />;
            case 'REJECTED':
                return <Chip label="Từ chối" color="error" size="small" sx={{ fontWeight: 600, borderRadius: 1 }} />;
            default:
                return <Chip label={status} size="small" sx={{ fontWeight: 600, borderRadius: 1 }} />;
        }
    };

    if (loading && requests.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <CustomSkeleton type="table" count={5} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Top Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                    Quản lý đơn đổi phòng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Duyệt đơn xin đổi phòng của sinh viên trong học kỳ hiện tại.
                </Typography>
            </Box>

            {/* Filter Options */}
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2, color: 'text.secondary' }}>
                    <FilterList fontSize="small" />
                    <Typography variant="body2" fontWeight="600">
                        Bộ lọc
                    </Typography>
                </Box>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Tìm theo phòng hoặc MSSV..."
                    value={filterKeyword}
                    onChange={(e) => {
                        setFilterKeyword(e.target.value);
                        setPage(0);
                    }}
                    sx={{ width: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                <FormControl
                    size="small"
                    variant="outlined"
                    sx={{ width: { xs: '100%', sm: 200 } }}
                >
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                        label="Trạng thái"
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setPage(0);
                        }}
                        sx={{ borderRadius: 1.5 }}
                    >
                        <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                        <MenuItem value="PENDING">Đang chờ</MenuItem>
                        <MenuItem value="APPROVED">Đã duyệt</MenuItem>
                        <MenuItem value="REJECTED">Từ chối</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            {/* Main Grid/Table Wrapper */}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
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
                                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary', fontStyle: 'italic' }}>
                                    Không tìm thấy đơn xin đổi phòng nào phù hợp.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedRequests.map((req) => (
                                <TableRow key={req.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                            {new Date(req.createdAt).toLocaleString('vi-VN')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{req.studentName || 'N/A'}</Typography>
                                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">{req.studentCode || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{req.currentRoomName || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{req.targetRoomName || 'Không xác định'}</Typography>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            maxWidth: 250,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            {req.reason}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{renderStatus(req.status)}</TableCell>
                                    <TableCell align="center">
                                        {req.status === 'PENDING' && (
                                            <Box display="flex" gap={1} justifyContent="center">
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    disableElevation
                                                    onClick={() => handleProcessOpen(req, true)}
                                                    sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 2 }}
                                                >
                                                    Duyệt
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleProcessOpen(req, false)}
                                                    sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 2 }}
                                                >
                                                    Từ chối
                                                </Button>
                                            </Box>
                                        )}
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
                sx={{ borderTop: '1px solid', borderColor: 'divider' }}
            />

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
                <DialogContent dividers sx={{ py: 2 }}>
                    <Box display="flex" flexDirection="column" gap={2} pt={0.5}>
                        <TextField
                            label="Ghi chú của admin"
                            multiline
                            rows={3}
                            fullWidth
                            size="small"
                            value={processData.adminNote}
                            onChange={(e) => setProcessData({ ...processData, adminNote: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                                    sx={{ borderRadius: 1.5 }}
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
                                helperText="Sinh viên không chọn phòng đích. Vui lòng nhập ID giường hoặc cập nhật hệ thống để hỗ trợ chọn phòng."
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                            />
                        ) : null}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={() => setProcessDialogOpen(false)}
                        color="inherit"
                        sx={{ textTransform: 'none', borderRadius: 1.5, color: 'text.secondary' }}
                    >
                        Hủy
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