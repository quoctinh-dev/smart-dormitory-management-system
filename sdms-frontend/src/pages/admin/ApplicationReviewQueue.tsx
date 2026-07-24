import {
    Visibility,
    Search as SearchIcon,
    Warning as WarningIcon,
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
    Button,
    Chip,
    TextField,
    InputAdornment,
    Stack,
    Tabs,
    Tab,
    TablePagination,
    Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useApplicationQueue } from '@/hooks/useApplicationQueue';

const STATUS_MAPPING: Record<
    string,
    { label: string; color: 'warning' | 'error' | 'success' | 'info' | 'default' | 'secondary' }
> = {
    PENDING: { label: 'Chờ duyệt', color: 'warning' },
    UNDER_REVIEW: { label: 'Đang xét', color: 'warning' },
    REQUEST_REVISION: { label: 'Cần bổ sung', color: 'error' },
    APPROVED: { label: 'Đã duyệt', color: 'success' },
    WAITING_PAYMENT: { label: 'Chờ đóng phí', color: 'info' },
    REJECTED: { label: 'Từ chối', color: 'error' },
    WAITING_LIST: { label: 'Danh sách chờ', color: 'secondary' },
};

export default function ApplicationReviewQueue() {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const { applications, totalElements, loading, error, refreshQueue } = useApplicationQueue(
        page,
        rowsPerPage,
        statusFilter === 'ALL' ? null : statusFilter,
        debouncedSearch
    );

    // Auto refresh every 5 minutes since it's a queue
    useEffect(() => {
        const interval = setInterval(() => refreshQueue(), 300000);
        return () => clearInterval(interval);
    }, [refreshQueue]);

    const handleViewDetails = (applicationId: string) => () => {
        navigate(`/admin/applications/${applicationId}/review`);
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* HEADER */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                    Duyệt hồ sơ lưu trú
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Quản lý, theo dõi và xét duyệt các đơn đăng ký nội trú của sinh viên.
                </Typography>
            </Box>

            {/* TABS FILTER */}
            <Tabs
                value={statusFilter}
                onChange={(_, newValue) => {
                    setStatusFilter(newValue);
                    setPage(0);
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    mb: 3,
                    borderBottom: 1,
                    borderColor: 'divider',
                    minHeight: 44,
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 500,
                        minHeight: 44,
                        fontSize: '0.95rem'
                    },
                    '& .Mui-selected': {
                        fontWeight: 600
                    }
                }}
            >
                <Tab label="Tất cả hồ sơ" value="ALL" />
                {Object.entries(STATUS_MAPPING).map(([key, value]) => (
                    <Tab key={key} label={value.label} value={key} />
                ))}
            </Tabs>

            {/* SEARCH BAR */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        fullWidth
                        placeholder="Tìm kiếm theo Tên, MSSV, CCCD, Mã Đơn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearchKeyPress}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                    <Button
                        variant="contained"
                        disableElevation
                        onClick={() => {
                            setDebouncedSearch(searchTerm);
                            setPage(0);
                        }}
                        sx={{
                            whiteSpace: 'nowrap',
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: 120,
                            height: 40,
                            width: { xs: '100%', md: 'auto' }
                        }}
                    >
                        Tìm kiếm
                    </Button>
                </Stack>
            </Paper>

            {/* TABLE DATA */}
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                                <TableCell sx={{ fontWeight: 600 }}>Mã đơn</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Họ và tên</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>MSSV</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>CCCD </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Ngày nộp</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>
                                    Thao tác
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ p: 4 }}>
                                        <CustomSkeleton type="list" count={4} />
                                    </TableCell>
                                </TableRow>
                            ) : applications.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        align="center"
                                        sx={{ py: 6 }}
                                    >
                                        <Typography color="text.secondary" variant="body2" sx={{ fontStyle: 'italic' }}>
                                            Không tìm thấy hồ sơ đăng ký nào phù hợp.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                applications.map((app) => {
                                    const statusConfig = STATUS_MAPPING[app.status] || {
                                        label: app.status,
                                        color: 'default',
                                    };

                                    return (
                                        <TableRow
                                            key={app.applicationId}
                                            hover
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', fontFamily: 'monospace' }}>
                                                    {app.applicationCode || '---'}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {app.fullName}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                                    {app.studentCode || '-'}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                    {app.cccd}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('vi-VN') : '---'}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <Chip
                                                        label={statusConfig.label}
                                                        color={statusConfig.color}
                                                        size="small"
                                                        sx={{ fontWeight: 600, borderRadius: 1 }}
                                                    />
                                                    {app.status === 'REQUEST_REVISION' && app.revisionDeadline && (
                                                        <Tooltip title={`Hạn chót bổ sung: ${new Date(app.revisionDeadline).toLocaleString('vi-VN')}`}>
                                                            <WarningIcon color="error" fontSize="small" sx={{ ml: 0.5 }} />
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Button
                                                    variant="contained"
                                                    disableElevation
                                                    size="small"
                                                    color="primary"
                                                    startIcon={<Visibility fontSize="small" />}
                                                    onClick={handleViewDetails(app.applicationId)}
                                                    sx={{ borderRadius: 1.5, px: 2, textTransform: 'none', fontWeight: 600 }}
                                                >
                                                    Kiểm duyệt
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* PAGINATION */}
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
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        labelRowsPerPage="Số dòng mỗi trang:"
                        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
                    />
                )}
            </Paper>
        </Box>
    );
}