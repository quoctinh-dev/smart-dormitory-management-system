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
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Duyệt hồ sơ lưu trú
      </Typography>

      {/* TABS FILTER */}
      <Tabs
        value={statusFilter}
        onChange={(_, newValue) => {
          setStatusFilter(newValue);
          setPage(0);
        }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Tất cả" value="ALL" sx={{ fontWeight: 'bold' }} />
        {Object.entries(STATUS_MAPPING).map(([key, value]) => (
          <Tab key={key} label={value.label} value={key} sx={{ fontWeight: 'bold' }} />
        ))}
      </Tabs>

      {/* SEARCH BAR */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 4 }}>
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
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            size="small"
          />
          <Button
            variant="contained"
            onClick={() => {
              setDebouncedSearch(searchTerm);
              setPage(0);
            }}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Tìm kiếm
          </Button>
        </Stack>
      </Paper>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 4,
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04) }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Mã đơn</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Họ và tên</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>MSSV</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>CCCD / CMND</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ngày nộp</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ p: 4 }}>
                  <CustomSkeleton type="list" count={4} />
                </TableCell>
              </TableRow>
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 6, color: 'text.secondary', fontStyle: 'italic' }}
                >
                  Không tìm thấy hồ sơ đăng ký nào phù hợp.
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
                    sx={{ '&:last-child cell': { border: 0 } }}
                  >
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {app.applicationCode || '---'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{app.fullName}</TableCell>
                    <TableCell>{app.studentCode || '-'}</TableCell>
                    <TableCell>{app.cccd}</TableCell>
                    <TableCell>
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('vi-VN') : '---'}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          label={statusConfig.label}
                          color={statusConfig.color}
                          size="small"
                          sx={{ fontWeight: 'bold', borderRadius: 2 }}
                        />
                        {app.status === 'REQUEST_REVISION' && app.revisionDeadline && (
                          <Tooltip title={`Hạn chót bổ sung: ${new Date(app.revisionDeadline).toLocaleString('vi-VN')}`}>
                            <WarningIcon color="error" fontSize="small" />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        startIcon={<Visibility />}
                        onClick={handleViewDetails(app.applicationId)}
                        sx={{ borderRadius: 1.5, px: 2 }}
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
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Số dòng:"
      />
    </Box>
  );
}
