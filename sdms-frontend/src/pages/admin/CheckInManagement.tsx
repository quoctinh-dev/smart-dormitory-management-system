import { Search, FilterList, CheckCircle, PendingActions } from '@mui/icons-material';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';

import { useCheckInManagement } from '@/hooks/useCheckInManagement';

export default function CheckInManagement() {
    const {
        data,
        loading,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        totalElements,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        startDate,       // Cần bổ sung thêm state này trong hook của bạn
        setStartDate,    // Cần bổ sung thêm state này trong hook của bạn
        endDate,         // Cần bổ sung thêm state này trong hook của bạn
        setEndDate,      // Cần bổ sung thêm state này trong hook của bạn
        fetchList,
        handleManualCheckIn,
    } = useCheckInManagement();

    const handleSearch = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            setPage(0);
            fetchList();
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header trang */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                    Quản lý & báo cáo nhận phòng
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Bảng đối soát danh sách sinh viên đã và đang chờ nhận phòng. Thao tác thực thi chính nên
                    dùng qua ứng dụng di động.
                </Typography>
            </Box>

            {/* Thanh công cụ lọc */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems="center"
                    useFlexGap
                    flexWrap="wrap"
                >
                    <TextField
                        size="small"
                        placeholder="Tìm theo MSSV, tên..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        sx={{ flexGrow: 1, minWidth: { xs: '100%', md: 250 }, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 220, width: { xs: '100%', md: 'auto' } }}>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            value={filterStatus}
                            label="Trạng thái"
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setPage(0);
                            }}
                            sx={{ borderRadius: 1.5 }}
                        >
                            <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                            <MenuItem value="PENDING_CHECKIN">Chưa nhận phòng (chờ)</MenuItem>
                            <MenuItem value="OCCUPIED">Đã nhận phòng (đang ở)</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        type="date"
                        size="small"
                        label="Từ ngày"
                        InputLabelProps={{ shrink: true }}
                        value={startDate || ''}
                        onChange={(e) => setStartDate(e.target.value)}
                        sx={{ minWidth: 150, width: { xs: '100%', md: 'auto' }, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />

                    <TextField
                        type="date"
                        size="small"
                        label="Đến ngày"
                        InputLabelProps={{ shrink: true }}
                        value={endDate || ''}
                        onChange={(e) => setEndDate(e.target.value)}
                        sx={{ minWidth: 150, width: { xs: '100%', md: 'auto' }, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />

                    <Button
                        variant="contained"
                        disableElevation
                        startIcon={<FilterList fontSize="small" />}
                        onClick={() => {
                            setPage(0);
                            fetchList();
                        }}
                        sx={{
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: 120,
                            width: { xs: '100%', md: 'auto' }
                        }}
                    >
                        Lọc dữ liệu
                    </Button>
                </Stack>
            </Paper>

            {/* Bảng dữ liệu */}
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader sx={{ minWidth: 900 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                                    Sinh viên
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                                    Vị trí phòng
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                                    Trạng thái
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                                    Giờ nhận phòng
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                                    Thao tác
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary" variant="body2">
                                            Đang tải dữ liệu...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary" variant="body2">
                                            Không có dữ liệu đối soát phù hợp.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((row) => (
                                    <TableRow key={row.assignmentId} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                {row.student?.fullName || 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                                {row.student?.studentCode || 'N/A'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {row.buildingName} - P.{row.roomCode}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Giường {row.bedCode}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            {row.status === 'OCCUPIED' ? (
                                                <Chip
                                                    icon={<CheckCircle fontSize="small" />}
                                                    label="Đã nhận phòng"
                                                    color="success"
                                                    size="small"
                                                    sx={{ fontWeight: 600, borderRadius: 1 }}
                                                />
                                            ) : (
                                                <Chip
                                                    icon={<PendingActions fontSize="small" />}
                                                    label="Chờ nhận phòng"
                                                    color="warning"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontWeight: 600, borderRadius: 1 }}
                                                />
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: row.checkInAt ? 'text.primary' : 'text.disabled', fontWeight: row.checkInAt ? 500 : 400 }}>
                                                {row.checkInAt ? new Date(row.checkInAt).toLocaleString('vi-VN') : 'Chưa ghi nhận'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                            {row.status === 'PENDING_CHECKIN' ? (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => handleManualCheckIn(row.assignmentId)}
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                                        '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1) }
                                                    }}
                                                >
                                                    Check-in thủ công
                                                </Button>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">
                                                    Không khả dụng
                                                </Typography>
                                            )}
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
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[10, 25, 50]}
                    labelRowsPerPage="Số dòng mỗi trang:"
                    sx={{ borderTop: '1px solid', borderColor: 'divider' }}
                />
            </Paper>
        </Box>
    );
}