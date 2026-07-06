import { Box, Paper, Stack, Typography, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';

import dashboardApi, { DashboardStatsResponse } from '@/api/dashboardApi';
import { useAuth } from '@/auth';

const StatCard = ({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 3,
      borderLeft: '6px solid',
      borderColor: color, // MUI tự động map màu từ palette nếu truyền đúng key
    }}
  >
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ color: color }}>
        {value}
      </Typography>
    </Stack>
  </Paper>
);

export default function AdminDashboard() {
  const { admin } = useAuth();
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getStats();
        // Extract data properly if it is wrapped in an ApiResponse, or use it directly
        setData((res as any).data || res);
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = data
    ? [
        { title: 'Hồ sơ chờ duyệt', value: data.pendingApplications, color: 'warning.main' },
        { title: 'Chưa thanh toán phí', value: data.waitingForPayment, color: 'error.main' },
        { title: 'Chưa làm thủ tục Check-in', value: data.pendingCheckIn, color: 'secondary.main' },
        { title: 'Sinh viên đang lưu trú', value: data.occupiedAssignments, color: 'success.main' },
        { title: 'Tổng số Toà nhà', value: data.totalBuildings, color: 'info.main' },
        { title: 'Tổng số Tầng', value: data.totalFloors, color: 'info.light' },
        { title: 'Tổng số Phòng', value: data.totalRooms, color: 'info.dark' },
        { title: 'Tổng số Giường', value: data.totalBeds, color: 'primary.main' },
      ]
    : [];

  return (
    <Box>
      {/* PAGE TITLE */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800}>
          Dashboard Báo Cáo
        </Typography>
        <Typography color="text.secondary" mt={0.5}>
          Xin chào, {admin?.username || 'Quản trị viên'}! Chúc một ngày làm việc hiệu quả.
        </Typography>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
