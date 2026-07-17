import { Box, Paper, Stack, Typography, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

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
      borderColor: color,
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
        { title: 'Tổng số Phòng', value: data.totalRooms, color: 'info.dark' },
        { title: 'Tổng số Giường', value: data.totalBeds, color: 'primary.main' },
      ]
    : [];

  const revenueStats = data
    ? [
        { title: 'TỔNG TIỀN ĐÃ THU (VNĐ)', value: new Intl.NumberFormat('vi-VN').format(data.totalCollectedAmount || 0) + ' đ', color: 'success.main' },
        { title: 'Số Hóa Đơn Đã Thu', value: data.paidBillsCount || 0, color: 'info.main' },
        { title: 'Số Hóa Đơn Còn Nợ', value: data.unpaidBillsCount || 0, color: 'error.main' },
      ]
    : [];

  const pieData = data
    ? [
        { name: 'Đang ở trong KTX', value: data.studentsInside },
        { name: 'Đang ở ngoài KTX', value: data.studentsOutside },
      ]
    : [];

  const PIE_COLORS = ['#4caf50', '#f44336']; // Green for inside, Red for outside

  const barData = data?.hourlyTraffic || [];

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800}>
          Dashboard Kiểm Soát
        </Typography>
        <Typography color="text.secondary" mt={0.5}>
          Xin chào, {admin?.username || 'Quản trị viên'}! Báo cáo hoạt động trực tiếp của hệ thống.
        </Typography>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {/* Main Chart Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Trạng thái Sinh viên (Curfew Tracking)
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Lưu lượng ra vào theo giờ (Hôm nay)
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="in" name="Đi vào (IN)" fill="#4caf50" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="out" name="Đi ra (OUT)" fill="#f44336" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Quick Stats Section */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" fontWeight="bold" mb={2} mt={2}>
              Chỉ số chung
            </Typography>
          </Grid>
          {stats.map((stat, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard {...stat} />
            </Grid>
          ))}

          {/* Revenue Stats Section */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" fontWeight="bold" mb={2} mt={4}>
              Báo cáo Tình hình Thu phí (Doanh thu thực tế)
            </Typography>
          </Grid>
          {revenueStats.map((stat, index) => (
            <Grid key={`rev-${index}`} size={{ xs: 12, sm: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  borderLeft: '6px solid',
                  borderColor: stat.color,
                  bgcolor: index === 0 ? 'success.light' : 'background.paper',
                  color: index === 0 ? 'white' : 'text.primary',
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="body2" color={index === 0 ? 'white' : 'text.secondary'} fontWeight={500}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ color: index === 0 ? 'white' : stat.color }}>
                    {stat.value}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
