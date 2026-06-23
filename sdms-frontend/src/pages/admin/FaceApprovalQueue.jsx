import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardMedia, CardContent, CardActions, Button, Chip, TextField } from '@mui/material';
import { faceApi } from '@/api';
import { useAuth } from '@/auth/AuthContext';

export default function FaceApprovalQueue() {
    const { admin } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingFaces = async () => {
        try {
            setLoading(true);
            const res = await faceApi.getPendingProfiles({ page: 0, size: 50 });
            setProfiles(res.content || []);
        } catch (error) {
            console.error("Failed to fetch pending faces", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingFaces();
    }, []);

    const handleApprove = async (profileId) => {
        try {
            await faceApi.approveFace(profileId, admin?.id || "00000000-0000-0000-0000-000000000000");
            fetchPendingFaces();
        } catch (error) {
            alert("Lỗi khi duyệt ảnh: " + (error.response?.data?.message || error.message));
        }
    };

    const handleReject = async (profileId) => {
        const reason = prompt("Lý do từ chối (Ảnh mờ, Sai góc độ, v.v.):");
        if (!reason) return;
        
        try {
            await faceApi.rejectFace(profileId, reason);
            fetchPendingFaces();
        } catch (error) {
            alert("Lỗi khi từ chối ảnh: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={3}>Kiểm Duyệt Ảnh Khuôn Mặt</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Ảnh chân dung được duyệt sẽ dùng làm mẫu AI để mở cổng tự động.
            </Typography>

            {loading ? (
                <Typography>Đang tải dữ liệu...</Typography>
            ) : profiles.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, bgcolor: '#f8fafc' }} elevation={0}>
                    <Typography color="text.secondary">Không có ảnh nào chờ duyệt.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {profiles.map((profile) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={profile.profileId}>
                            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                <CardMedia
                                    component="img"
                                    height="240"
                                    image={profile.pendingFaceImageUrl || 'https://via.placeholder.com/240?text=No+Image'}
                                    alt="Student Face"
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent>
                                    <Typography variant="h6" noWrap>{profile.studentName || 'Sinh viên vô danh'}</Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap mb={1}>
                                        ID: {profile.studentId}
                                    </Typography>
                                    <Chip label="Chờ duyệt" size="small" color="warning" />
                                </CardContent>
                                <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
                                    <Button size="small" color="error" variant="outlined" onClick={() => handleReject(profile.profileId)}>
                                        Từ chối
                                    </Button>
                                    <Button size="small" color="success" variant="contained" onClick={() => handleApprove(profile.profileId)} disableElevation>
                                        Chấp nhận
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
