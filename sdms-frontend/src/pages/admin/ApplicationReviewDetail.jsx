import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Divider, List, ListItem, ListItemText, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Cancel, ArrowBack, Assignment, PictureAsPdf, ReplayCircleFilled } from '@mui/icons-material';
import applicationApi from '@/api/applicationApi';

export default function ApplicationReviewDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
    const [revisionNote, setRevisionNote] = useState('');
    const [deadlineDays, setDeadlineDays] = useState(3);

    const fetchApp = React.useCallback(async () => {
        try {
            const res = await applicationApi.getAll({ page: 0, size: 100 });
            const found = res?.content?.find(a => a.applicationId === id);
            if (found) {
                setApp(found);
            } else {
                alert("Không tìm thấy hồ sơ!");
                navigate('/admin/applications/review');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchApp();
    }, [fetchApp]);

    const handleApprove = async () => {
        try {
            await applicationApi.approve(id, "Được duyệt trên Web Admin");
            navigate('/admin/applications/review');
        } catch (error) {
            alert("Lỗi khi duyệt: " + (error.response?.data?.message || error.message));
        }
    };

    const handleReject = async () => {
        try {
            const note = prompt("Nhập lý do từ chối:");
            if (!note) return;
            await applicationApi.reject(id, note);
            navigate('/admin/applications/review');
        } catch (error) {
            alert("Lỗi khi từ chối: " + (error.response?.data?.message || error.message));
        }
    };

    const handleRequestRevision = async () => {
        try {
            await applicationApi.requestRevision(id, revisionNote, deadlineDays);
            setRevisionDialogOpen(false);
            alert("Đã gửi yêu cầu bổ sung hồ sơ cho sinh viên!");
            navigate('/admin/applications/review');
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || error.message));
        }
    };

    const handleVerifyDocument = async (docId, status) => {
        try {
            const note = status === 'INVALID' ? prompt("Nhập lý do không hợp lệ:") : "Hợp lệ";
            if (status === 'INVALID' && !note) return;
            await applicationApi.verifyDocument(docId, status, note);
            fetchApp(); // Reload to get updated status
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <Box p={3}><Typography>Đang tải dữ liệu...</Typography></Box>;
    if (!app) return null;

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/applications/review')} color="inherit">
                    Quay lại danh sách
                </Button>
                <Typography variant="h4" fontWeight="bold" ml={3}>Kiểm Duyệt Chi Tiết Hồ Sơ</Typography>
                <Box flexGrow={1} />
                {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && (
                    <Box display="flex" gap={1}>
                        <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={handleReject}>Từ Chối</Button>
                        <Button variant="outlined" color="warning" startIcon={<ReplayCircleFilled />} onClick={() => setRevisionDialogOpen(true)}>Yêu Cầu Bổ Sung</Button>
                        <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={handleApprove}>Duyệt Hợp Lệ</Button>
                    </Box>
                )}
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>Thông Tin Sinh Viên</Typography>
                        <List dense>
                            <ListItem><ListItemText primary="Họ tên" secondary={app.fullName} /></ListItem>
                            <ListItem><ListItemText primary="CCCD" secondary={app.cccd} /></ListItem>
                            <ListItem><ListItemText primary="Ngày sinh" secondary={app.dob} /></ListItem>
                            <ListItem><ListItemText primary="Giới tính" secondary={app.gender === 'MALE' ? 'Nam' : 'Nữ'} /></ListItem>
                            <ListItem><ListItemText primary="SĐT" secondary={app.phone} /></ListItem>
                            <ListItem><ListItemText primary="Email" secondary={app.email} /></ListItem>
                            <ListItem><ListItemText primary="HKTT" secondary={app.permanentAddress} /></ListItem>
                            <ListItem><ListItemText primary="Liên hệ" secondary={app.contactAddress} /></ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary="Diện ưu tiên" 
                                    secondary={app.priorityCategories?.length > 0 ? app.priorityCategories.join(", ") : "Không có"} 
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, borderRadius: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center">
                                    <PictureAsPdf sx={{ mr: 1, color: '#ef4444' }} /> Tài Liệu Sinh Tự Động (Cần đối chiếu)
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                {app.applicationPdfUrl ? (
                                    <Box display="flex" gap={2}>
                                        <Button 
                                            variant="contained" 
                                            color="error" 
                                            href={`${import.meta.env.VITE_API_URL}${app.applicationPdfUrl}`} 
                                            target="_blank"
                                        >
                                            Mở Phiếu Đăng Ký (PDF)
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            color="error" 
                                            href={`${import.meta.env.VITE_API_URL}${app.applicationPdfUrl.replace('registration_', 'commitment_')}`} 
                                            target="_blank"
                                        >
                                            Mở Bản Cam Kết (PDF)
                                        </Button>
                                        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                                            * Hệ thống tự động sinh 2 file PDF chuẩn biểu mẫu.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Chưa có file PDF.</Typography>
                                )}
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, borderRadius: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center">
                                    <Assignment sx={{ mr: 1, color: 'primary.main' }} /> Minh Chứng Kèm Theo (Sinh viên nộp)
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    {app.documents && app.documents.length > 0 ? (
                                        app.documents.map((doc, idx) => (
                                            <Grid item xs={12} sm={6} md={4} key={idx}>
                                                <Card variant="outlined" sx={{ 
                                                    borderRadius: 2, 
                                                    borderColor: doc.status === 'VALID' ? '#22c55e' : (doc.status === 'INVALID' ? '#ef4444' : undefined) 
                                                }}>
                                                    <Box sx={{ height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#f8fafc', overflow: 'hidden' }}>
                                                        <img 
                                                            src={doc.fileUrl?.startsWith('http') ? doc.fileUrl : `${import.meta.env.VITE_API_URL}${doc.fileUrl}`} 
                                                            alt={doc.documentType} 
                                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=Lỗi+Ảnh' }}
                                                        />
                                                    </Box>
                                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                        <Typography variant="caption" fontWeight="bold" display="block" textAlign="center" color={doc.status === 'INVALID' ? 'error' : 'inherit'}>
                                                            {doc.documentType} {doc.status === 'INVALID' && '(Sai)'}
                                                        </Typography>
                                                        {doc.note && doc.status === 'INVALID' && (
                                                            <Typography variant="caption" color="error" display="block" textAlign="center">Lý do: {doc.note}</Typography>
                                                        )}
                                                        <Box display="flex" justifyContent="space-between" mt={1}>
                                                            <Button size="small" color="success" variant={doc.status === 'VALID' ? 'contained' : 'outlined'} onClick={() => handleVerifyDocument(doc.documentId, 'VALID')}>Hợp lệ</Button>
                                                            <Button size="small" color="error" variant={doc.status === 'INVALID' ? 'contained' : 'outlined'} onClick={() => handleVerifyDocument(doc.documentId, 'INVALID')}>Sai</Button>
                                                        </Box>
                                                        <Button 
                                                            size="small" 
                                                            fullWidth 
                                                            variant="text" 
                                                            href={doc.fileUrl?.startsWith('http') ? doc.fileUrl : `${import.meta.env.VITE_API_URL}${doc.fileUrl}`} 
                                                            target="_blank"
                                                            sx={{ mt: 1 }}
                                                        >
                                                            Xem Ảnh
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="error">Không có tài liệu minh chứng nào được đính kèm!</Typography>
                                    )}
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* Request Revision Dialog */}
            <Dialog open={revisionDialogOpen} onClose={() => setRevisionDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Yêu cầu bổ sung hồ sơ</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" mb={2} color="error">
                        Lưu ý: Bạn phải đánh dấu ít nhất 1 tài liệu ở trạng thái "Sai" trước khi có thể yêu cầu sinh viên bổ sung.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Ghi chú tổng quan (Nội dung Email)"
                        fullWidth
                        multiline
                        rows={3}
                        value={revisionNote}
                        onChange={(e) => setRevisionNote(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Thời hạn bổ sung (Ngày)"
                        type="number"
                        fullWidth
                        value={deadlineDays}
                        onChange={(e) => setDeadlineDays(e.target.value)}
                        inputProps={{ min: 1 }}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRevisionDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleRequestRevision} variant="contained" color="warning">Gửi Yêu Cầu (Gửi Email)</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
