import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, CircularProgress, Alert, LinearProgress, Stack, Chip, Divider, IconButton } from '@mui/material';
import { Apartment, Business, Room, Hotel, DomainVerification, Handyman, SingleBed } from '@mui/icons-material';
import { roomApi } from '@/api';

export default function RoomDashboard() {
    const [overview, setOverview] = useState(null);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [overviewRes, buildingsRes] = await Promise.all([
                roomApi.getOverview(),
                roomApi.getAllBuildings()
            ]);
            setOverview(overviewRes);
            setBuildings(buildingsRes || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const renderKPICard = (title, value, icon, color, subtitle) => (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${color}15`, color: color }}>
                {icon}
            </Box>
            <Box>
                <Typography color="text.secondary" variant="body2" fontWeight="bold" textTransform="uppercase">{title}</Typography>
                <Typography variant="h3" fontWeight="900" color="text.primary">{value}</Typography>
                {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
            </Box>
        </Paper>
    );

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={1}>Hạ tầng KTX</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Tổng quan cơ sở vật chất, tình trạng sức chứa và các tòa nhà.
            </Typography>

            {/* KPI ROW */}
            <Grid container spacing={3} mb={5}>
                <Grid item xs={12} sm={6} md={3}>
                    {renderKPICard('Tòa Nhà', overview?.totalBuildings || 0, <Apartment fontSize="large" />, '#3b82f6')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {renderKPICard('Tầng', overview?.totalFloors || 0, <Business fontSize="large" />, '#8b5cf6')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {renderKPICard('Phòng', overview?.totalRooms || 0, <Room fontSize="large" />, '#f59e0b')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {renderKPICard('Tổng Giường', overview?.totalBeds || 0, <Hotel fontSize="large" />, '#10b981')}
                </Grid>
            </Grid>

            {/* OCCUPANCY ROW */}
            <Grid container spacing={3} mb={5}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" mb={3}>Tỷ lệ lấp đầy</Typography>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Box flexGrow={1}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={overview?.occupancyRate || 0} 
                                    sx={{ height: 24, borderRadius: 12, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} 
                                />
                            </Box>
                            <Typography variant="h5" fontWeight="bold" color="#10b981">
                                {overview?.occupancyRate?.toFixed(1) || 0}%
                            </Typography>
                        </Box>
                        
                        <Grid container spacing={2} mt={3}>
                            <Grid item xs={4}>
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <DomainVerification sx={{ color: '#10b981' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Đã thuê (Occupied)</Typography>
                                        <Typography variant="h6" fontWeight="bold">{overview?.occupiedBeds || 0}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid item xs={4}>
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <SingleBed sx={{ color: '#3b82f6' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Giường trống (Available)</Typography>
                                        <Typography variant="h6" fontWeight="bold">{overview?.availableBeds || 0}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid item xs={4}>
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Handyman sx={{ color: '#ef4444' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Bảo trì (Maintenance)</Typography>
                                        <Typography variant="h6" fontWeight="bold">{overview?.maintenanceBeds || 0}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                    {/* BUILDINGS LIST */}
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" mb={3}>Danh sách Tòa nhà</Typography>
                        {buildings.length === 0 ? (
                            <Typography color="text.secondary">Chưa có tòa nhà nào.</Typography>
                        ) : (
                            <Stack spacing={2} divider={<Divider />}>
                                {buildings.map(b => (
                                    <Box key={b.buildingId} display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography fontWeight="bold">{b.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">Mã: {b.code}</Typography>
                                        </Box>
                                        <Chip 
                                            label={b.status} 
                                            size="small" 
                                            color={b.status === 'ACTIVE' ? 'success' : 'default'} 
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
