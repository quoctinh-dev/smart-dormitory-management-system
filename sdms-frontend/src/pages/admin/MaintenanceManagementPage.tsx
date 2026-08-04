import React, { useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import { alpha } from '@mui/material/styles';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useMaintenanceAdmin } from '@/hooks/useMaintenanceAdmin';
import type { MaintenanceResponse, MaintenanceStatus } from '@/types/maintenance';

const STATUS_CONFIG: Record<MaintenanceStatus, { label: string; color: 'warning' | 'info' | 'success' | 'error' }> = {
    PENDING: { label: 'Chờ xử lý', color: 'warning' },
    IN_PROGRESS: { label: 'Đang sửa', color: 'info' },
    DONE: { label: 'Hoàn thành', color: 'success' },
    REJECTED: { label: 'Từ chối', color: 'error' }
};

export default function MaintenanceManagementPage() {
    const {
        data,
        loading,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        totalElements,
        updateStatus,
        statusFilter,
        setStatusFilter
    } = useMaintenanceAdmin();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceResponse | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, request: MaintenanceResponse) => {
        setAnchorEl(event.currentTarget);
        setSelectedRequest(request);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRequest(null);
    };

    const handleStatusChange = (newStatus: MaintenanceStatus) => {
        if (selectedRequest) {
            updateStatus(selectedRequest.id, newStatus);
        }
        handleMenuClose();
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* HEADER TRANG */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                        Quản lý báo cáo sự cố (Bảo trì)
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Tiếp nhận và cập nhật trạng thái sửa chữa các thiết bị hư hỏng do sinh viên báo cáo.
                    </Typography>
                </Box>
            </Box>

            {/* THANH CÔNG CỤ LỌC */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="status-filter-label">Lọc theo trạng thái</InputLabel>
                    <Select
                        labelId="status-filter-label"
                        value={statusFilter}
                        label="Lọc theo trạng thái"
                        onChange={(e) => {
                            setStatusFilter(e.target.value as MaintenanceStatus | '');
                            setPage(0); // Reset page on filter change
                        }}
                    >
                        <MenuItem value="">Tất cả trạng thái</MenuItem>
                        <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                        <MenuItem value="IN_PROGRESS">Đang sửa</MenuItem>
                        <MenuItem value="DONE">Hoàn thành</MenuItem>
                        <MenuItem value="REJECTED">Từ chối</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 2, mb: 4, overflow: 'hidden' }}>
                <Typography
                    variant="subtitle1"
                    sx={{ p: 2.5, fontWeight: 600, borderBottom: '1px solid', borderColor: 'divider' }}
                >
                    Danh sách yêu cầu bảo trì
                </Typography>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Ngày báo</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Phòng</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Mô tả sự cố</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Ảnh đính kèm</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ p: 0 }}>
                                        <CustomSkeleton type="table" count={rowsPerPage} />
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <BuildCircleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">
                                            Không có báo cáo sự cố nào
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>
                                            {new Date(row.createdAt).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell>{row.roomId.split('-')[0].toUpperCase()}</TableCell>
                                        <TableCell sx={{ maxWidth: 300 }}>
                                            <Typography variant="body2" sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {row.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {row.imageUrl ? (
                                                <Button 
                                                    size="small" 
                                                    variant="outlined" 
                                                    onClick={() => setPreviewImage(row.imageUrl!)}
                                                >
                                                    Xem ảnh
                                                </Button>
                                            ) : (
                                                <Typography variant="body2" color="text.disabled">Không có</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={STATUS_CONFIG[row.status].label}
                                                color={STATUS_CONFIG[row.status].color}
                                                size="small"
                                                sx={{ fontWeight: 600, borderRadius: 1 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={(e) => handleMenuClick(e, row)}>
                                                <MoreVertIcon />
                                            </IconButton>
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
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} trên ${count}`}
                    sx={{ borderTop: '1px solid', borderColor: 'divider' }}
                />
            </Paper>

            {/* Menu chuyển trạng thái */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleStatusChange('PENDING')}>Chuyển về Chờ xử lý</MenuItem>
                <MenuItem onClick={() => handleStatusChange('IN_PROGRESS')}>Đánh dấu Đang sửa</MenuItem>
                <MenuItem onClick={() => handleStatusChange('DONE')}>Đánh dấu Hoàn thành</MenuItem>
                <MenuItem onClick={() => handleStatusChange('REJECTED')}>Từ chối sửa</MenuItem>
            </Menu>

            {/* Dialog xem ảnh */}
            <Dialog open={Boolean(previewImage)} onClose={() => setPreviewImage(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Ảnh chụp sự cố</DialogTitle>
                <DialogContent>
                    {previewImage && (
                        <Box
                            component="img"
                            src={previewImage}
                            alt="Sự cố"
                            sx={{ width: '100%', height: 'auto', borderRadius: 1 }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewImage(null)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
