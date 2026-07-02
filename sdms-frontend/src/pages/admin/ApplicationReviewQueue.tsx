import { Visibility } from '@mui/icons-material';
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
  Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useApplicationQueue } from '@/hooks/useApplicationQueue';

const STATUS_MAPPING: Record<
  string,
  { label: string; color: 'warning' | 'error' | 'success' | 'info' | 'default' }
> = {
  PENDING: { label: 'Chờ duyệt', color: 'warning' },
  UNDER_REVIEW: { label: 'Đang xét', color: 'warning' },
  REQUEST_REVISION: { label: 'Cần bổ sung', color: 'error' },
  APPROVED: { label: 'Đã duyệt', color: 'success' },
  WAITING_PAYMENT: { label: 'Chờ đóng phí', color: 'info' },
  REJECTED: { label: 'Từ chối', color: 'error' },
};

export default function ApplicationReviewQueue() {
  const navigate = useNavigate();
  const { applications, loading, error } = useApplicationQueue();

  const handleViewDetails = (applicationId: string) => () => {
    navigate(`/admin/applications/${applicationId}/review`);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Duyệt Hồ Sơ Lưu Trú
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04) }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Họ và tên</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>CCCD / CMND</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ngày sinh</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ p: 4 }}>
                  <CustomSkeleton type="list" count={4} />
                </TableCell>
              </TableRow>
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 6, color: 'text.secondary', fontStyle: 'italic' }}
                >
                  Hiện tại không có hồ sơ đăng ký nào trong hàng đợi kiểm duyệt.
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
                    <TableCell sx={{ fontWeight: 500 }}>{app.fullName}</TableCell>
                    <TableCell>{app.cccd}</TableCell>
                    <TableCell>{app.dob || 'Chưa cập nhật'}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusConfig.label}
                        color={statusConfig.color}
                        size="small"
                        sx={{ fontWeight: '600', borderRadius: 1.5 }}
                      />
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
    </Box>
  );
}
