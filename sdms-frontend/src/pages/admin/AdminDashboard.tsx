import ApartmentIcon from '@mui/icons-material/Apartment';
import LayersIcon from '@mui/icons-material/Layers';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import BedIcon from '@mui/icons-material/Bed';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Paper, Typography, CircularProgress, useTheme, alpha, Avatar, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import Grid from '@mui/material/Grid2';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { Navigate } from 'react-router-dom';

import StatCard from '@/components/common/StatCard';
import { useAuth } from '@/providers/AuthProvider';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, expiringList, loading } = useAdminDashboard();
  const theme = useTheme();

  // Ngăn chặn STAFF truy cập trang Dashboard
  if (user?.role?.toUpperCase() === 'STAFF') {
    return <Navigate to="/admin/applications/review" replace />;
  }

  // 1. Tỉ lệ lấp đầy & Khả năng tiếp nhận
  const totalBeds = data?.totalBeds || 0;
  const occupiedBeds = data?.occupiedAssignments || 0;
  const vacantBeds = totalBeds > 0 ? totalBeds - occupiedBeds : 0;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const topStats = data
      ? [
        {
          title: 'Hồ sơ chờ duyệt',
          value: data.pendingApplications,
          color: 'warning' as const,
          icon: <AssignmentIcon fontSize="small" />,
          actionLink: { text: 'Duyệt ngay', url: '/admin/applications/review' }
        },
        {
          title: 'Chưa làm thủ tục (Check-in)',
          value: data.pendingCheckIn,
          color: 'secondary' as const,
          icon: <HowToRegIcon fontSize="small" />,
        },
        {
          title: 'Chờ thanh toán phí',
          value: data.waitingForPayment,
          color: 'error' as const,
          icon: <MoneyOffIcon fontSize="small" />,
        },
        {
          title: 'Giường trống hiện tại',
          value: vacantBeds,
          color: 'success' as const,
          icon: <EventAvailableIcon fontSize="small" />,
        },
      ]
      : [];

  const revenueStats = data
      ? [
        {
          title: 'Doanh thu thu được',
          value: new Intl.NumberFormat('vi-VN').format(data.totalCollectedAmount || 0) + ' đ',
          color: 'success' as const,
          icon: <AccountBalanceWalletIcon fontSize="small" />,
        },
        {
          title: 'Hóa đơn đã thanh toán',
          value: data.paidBillsCount || 0,
          color: 'info' as const,
          icon: <ReceiptIcon fontSize="small" />,
        },
        {
          title: 'Hóa đơn còn nợ',
          value: data.unpaidBillsCount || 0,
          color: 'error' as const,
          icon: <ReceiptLongIcon fontSize="small" />,
        },
      ]
      : [];

  // ECharts Configurations
  const getTrafficChartOption = () => {
    if (!data?.hourlyTraffic) return {};
    const times = data.hourlyTraffic.map(d => d.time);
    const inData = data.hourlyTraffic.map(d => d.in);
    const outData = data.hourlyTraffic.map(d => d.out);

    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { data: ['Đi vào (IN)', 'Đi ra (OUT)'], bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: times,
          axisLine: { lineStyle: { color: theme.palette.text.secondary } },
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: { lineStyle: { color: theme.palette.text.secondary } },
          splitLine: { lineStyle: { type: 'dashed', color: theme.palette.divider } }
        }
      ],
      series: [
        {
          name: 'Đi vào (IN)',
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: alpha(theme.palette.success.main, 0.5) },
              { offset: 1, color: alpha(theme.palette.success.main, 0.1) }
            ])
          },
          lineStyle: { color: theme.palette.success.main, width: 3 },
          itemStyle: { color: theme.palette.success.main },
          data: inData
        },
        {
          name: 'Đi ra (OUT)',
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: alpha(theme.palette.error.main, 0.5) },
              { offset: 1, color: alpha(theme.palette.error.main, 0.1) }
            ])
          },
          lineStyle: { color: theme.palette.error.main, width: 3 },
          itemStyle: { color: theme.palette.error.main },
          data: outData
        }
      ]
    };
  };

  const getOccupancyGaugeOption = () => {
    return {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 10,
          itemStyle: {
            color: occupancyRate > 90 ? theme.palette.error.main : occupancyRate > 70 ? theme.palette.warning.main : theme.palette.success.main
          },
          progress: {
            show: true,
            roundCap: true,
            width: 18
          },
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '12%',
            width: 20,
            offsetCenter: [0, '-60%'],
            itemStyle: { color: 'inherit' }
          },
          axisLine: {
            roundCap: true,
            lineStyle: { width: 18, color: [[1, theme.palette.divider]] }
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          title: { show: false },
          detail: {
            backgroundColor: 'transparent',
            width: '60%',
            lineHeight: 40,
            height: 40,
            borderRadius: 8,
            offsetCenter: [0, '20%'],
            valueAnimation: true,
            formatter: '{value}%',
            color: 'inherit',
            fontSize: 32,
            fontWeight: 'bolder'
          },
          data: [{ value: occupancyRate, name: 'Lấp đầy' }]
        }
      ]
    };
  };

  const getApplicationStatusOption = () => {
    if (!data?.applicationsByStatus) return {};
    const map = data.applicationsByStatus;
    const pieData = Object.keys(map).map(k => ({ name: k, value: map[k] })).filter(i => i.value > 0);
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%', left: 'center' },
      series: [
        {
          name: 'Đăng ký KTX',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: theme.palette.background.paper,
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' }
          },
          labelLine: { show: false },
          data: pieData
        }
      ]
    };
  };

  const getBillStatusOption = () => {
    if (!data?.billsByStatus) return {};
    const map = data.billsByStatus;
    const pieData = Object.keys(map).map(k => ({ name: k, value: map[k] })).filter(i => i.value > 0);
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%', left: 'center' },
      color: [theme.palette.success.main, theme.palette.error.main, theme.palette.warning.main],
      series: [
        {
          name: 'Hóa đơn',
          type: 'pie',
          radius: '70%',
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };

  return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box mb={3}>
          <Typography variant="h5" fontWeight={600} color="text.primary" mb={0.5}>
            Dashboard Quản Trị
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chào mừng trở lại, {user?.username || 'Quản trị viên'}! 👋 Dưới đây là tổng quan Cơ sở vật chất & Hoạt động KTX.
          </Typography>
        </Box>

        {loading ? (
            <Box display="flex" justifyContent="center" py={10}>
              <CircularProgress />
            </Box>
        ) : (
            <Grid container spacing={3}>
              {/* ----------------- INFRASTRUCTURE & OCCUPANCY ----------------- */}
              <Grid size={{ xs: 12, xl: 4 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={0.5}>
                    Cơ sở vật chất KTX
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Tổng quan quy mô và năng lực tiếp nhận của Ký túc xá.
                  </Typography>

                  <Grid container spacing={2}>
                    {[
                      { label: 'Tòa nhà', value: data?.totalBuildings || 0, icon: <ApartmentIcon fontSize="small" />, color: 'primary' },
                      { label: 'Tầng', value: data?.totalFloors || 0, icon: <LayersIcon fontSize="small" />, color: 'secondary' },
                      { label: 'Phòng', value: data?.totalRooms || 0, icon: <MeetingRoomIcon fontSize="small" />, color: 'info' },
                      { label: 'Giường', value: data?.totalBeds || 0, icon: <BedIcon fontSize="small" />, color: 'success' },
                    ].map((item, idx) => (
                        <Grid size={6} key={idx}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: (theme) => alpha(theme.palette.action.hover, 0.02) }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha((theme.palette as any)[item.color].main, 0.1), color: `${item.color}.main` }}>
                              {item.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight={600}>{item.value}</Typography>
                              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle1" fontWeight={600} mb={1} textAlign="center">
                    Tỉ lệ lấp đầy (Occupancy Rate)
                  </Typography>
                  <Box sx={{ flexGrow: 1, minHeight: 180, mt: -2 }}>
                    <ReactECharts option={getOccupancyGaugeOption()} style={{ height: '100%', width: '100%' }} />
                  </Box>
                  <Typography variant="body2" textAlign="center" color="text.secondary" mt={-3}>
                    Đã phân bổ <b>{occupiedBeds}</b> / {totalBeds} giường
                  </Typography>
                </Paper>
              </Grid>

              {/* ----------------- TOP STATS (Right Side) ----------------- */}
              <Grid size={{ xs: 12, xl: 8 }} container spacing={3}>
                {topStats.map((stat, index) => (
                    <Grid key={index} size={{ xs: 12, sm: 6, xl: 6 }}>
                      <StatCard {...stat} />
                    </Grid>
                ))}

                <Grid size={12}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                      Lưu lượng ra vào theo giờ (Hôm nay)
                    </Typography>
                    <Box sx={{ flexGrow: 1, height: 350 }}>
                      <ReactECharts option={getTrafficChartOption()} style={{ height: '100%', width: '100%' }} />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* ----------------- MIDDLE ROW (REVENUE) ----------------- */}
              <Grid size={12}>
                <Typography variant="subtitle1" fontWeight={600} mt={1}>
                  Tổng quan Tài chính
                </Typography>
              </Grid>
              {revenueStats.map((stat, index) => (
                  <Grid key={`rev-${index}`} size={{ xs: 12, sm: 4, xl: 4 }}>
                    <StatCard
                        title={stat.title}
                        value={stat.value}
                        color={stat.color}
                        icon={stat.icon}
                        actionLink={{ text: 'Quản lý thu phí', url: '/admin/payments' }}
                    />
                  </Grid>
              ))}

              {/* ----------------- BOTTOM ROW (PIE CHARTS) ----------------- */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Tình trạng Đăng ký & Gia hạn
                  </Typography>
                  <Box sx={{ flexGrow: 1, minHeight: 320 }}>
                    <ReactECharts option={getApplicationStatusOption()} style={{ height: '100%', width: '100%' }} />
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Trạng thái Thanh toán Hóa đơn
                  </Typography>
                  <Box sx={{ flexGrow: 1, minHeight: 320 }}>
                    <ReactECharts option={getBillStatusOption()} style={{ height: '100%', width: '100%' }} />
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Trạng thái Sinh viên (Curfew)
                  </Typography>
                  <Box sx={{ flexGrow: 1, minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ReactECharts
                        option={{
                          tooltip: { trigger: 'item' },
                          legend: { bottom: '0%', left: 'center' },
                          color: [theme.palette.success.main, theme.palette.error.main],
                          series: [{
                            name: 'Trạng thái',
                            type: 'pie',
                            radius: ['40%', '70%'],
                            data: [
                              { name: 'Trong KTX', value: data?.studentsInside || 0 },
                              { name: 'Ngoài KTX', value: data?.studentsOutside || 0 }
                            ]
                          }]
                        }}
                        style={{ height: '100%', width: '100%' }}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* ----------------- EXPIRING ASSIGNMENTS ----------------- */}
              <Grid size={12}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
                      <WarningAmberIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Sinh viên sắp hết hạn lưu trú (7 ngày tới)
                    </Typography>
                    <Chip label={expiringList?.length || 0} color="warning" size="small" sx={{ fontWeight: 600, borderRadius: 1 }} />
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                          <TableCell sx={{ fontWeight: 600 }}>MSSV</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Họ tên</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Tòa nhà</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Phòng</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Giường</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Ngày hết hạn</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(!expiringList || expiringList.length === 0) ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                <Typography color="text.secondary" variant="body2" fontStyle="italic">Không có sinh viên nào sắp hết hạn trong 7 ngày tới.</Typography>
                              </TableCell>
                            </TableRow>
                        ) : (
                            expiringList.map((item) => (
                                <TableRow key={item.assignmentId} hover>
                                  <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{item.studentCode}</TableCell>
                                  <TableCell sx={{ fontWeight: 500 }}>{item.studentName}</TableCell>
                                  <TableCell>{item.buildingName}</TableCell>
                                  <TableCell>{item.roomName}</TableCell>
                                  <TableCell>{item.bedName}</TableCell>
                                  <TableCell>
                                    <Typography color="error.main" fontWeight={600}>
                                      {item.endDate}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

            </Grid>
        )}
      </Box>
  );
}