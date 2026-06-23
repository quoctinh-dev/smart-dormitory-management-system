import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import applicationApi from '@/api/applicationApi';

export default function ApplicationReviewQueue() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await applicationApi.getAll({ page: 0, size: 50 });
            setApplications(res?.content || []);
        } catch (error) {
            console.error("Failed to fetch applications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleViewDetails = (app) => {
        navigate(`/admin/applications/${app.applicationId}/review`);
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={3}>Duyệt Hồ Sơ Lưu Trú</Typography>
            
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #f1f5f9' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                            <TableCell><b>Họ và tên</b></TableCell>
                            <TableCell><b>CCCD</b></TableCell>
                            <TableCell><b>Ngày sinh</b></TableCell>
                            <TableCell><b>Trạng thái</b></TableCell>
                            <TableCell align="center"><b>Hành động</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center">Đang tải dữ liệu...</TableCell></TableRow>
                        ) : applications.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center">Không có hồ sơ nào.</TableCell></TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.applicationId} hover>
                                    <TableCell>{app.fullName}</TableCell>
                                    <TableCell>{app.cccd}</TableCell>
                                    <TableCell>{app.dob || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={app.status} 
                                            color={app.status === 'PENDING' ? 'warning' : app.status === 'APPROVED' ? 'success' : app.status === 'WAITING_PAYMENT' ? 'info' : 'error'} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button 
                                            variant="contained" 
                                            size="small"
                                            color="primary"
                                            startIcon={<Visibility />}
                                            onClick={() => handleViewDetails(app)}
                                        >
                                            Kiểm duyệt
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
