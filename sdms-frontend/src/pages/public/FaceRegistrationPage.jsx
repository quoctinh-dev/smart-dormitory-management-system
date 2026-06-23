import React, { useState, useRef } from 'react';
import { Container, Paper, Typography, Box, Button, CircularProgress, Alert } from '@mui/material';
import { CameraAlt, CloudUpload } from '@mui/icons-material';
import { faceApi } from '@/api';

export default function FaceRegistrationPage() {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    // Hardcoded student ID for Demo purposes. In production, get from AuthContext or JWT.
    const STUDENT_ID = "11111111-1111-1111-1111-111111111111";

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setStatus(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setStatus(null);

        try {
            // STEP 1: Mock Upload Image to Cloudinary/S3
            // In a real flow, you call documentApi.upload() to get a URL back.
            // For this UI demo, we will use a dummy URL or mock the upload delay.
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockUploadedUrl = `https://sdms-bucket.s3.amazonaws.com/faces/${Date.now()}.jpg`;

            // STEP 2: Call Face API to register
            await faceApi.registerFace(STUDENT_ID, mockUploadedUrl);

            setStatus({
                type: 'success',
                message: 'Tải lên ảnh khuôn mặt thành công! Vui lòng chờ Ban Quản Lý phê duyệt.'
            });
            setSelectedFile(null);
            setPreviewUrl('');
            
        } catch (error) {
            setStatus({
                type: 'error',
                message: 'Lỗi tải ảnh: ' + (error.response?.data?.message || error.message)
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                <Typography variant="h4" fontWeight="900" mb={2}>Đăng Ký Khuôn Mặt</Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                    Vui lòng cung cấp một bức ảnh chân dung rõ nét, chụp trực diện để hệ thống thiết lập dữ liệu nhận diện khuôn mặt mở cổng tự động.
                </Typography>

                {status && (
                    <Alert severity={status.type} sx={{ mb: 3, textAlign: 'left' }}>
                        {status.message}
                    </Alert>
                )}

                <Box 
                    sx={{ 
                        width: '100%', 
                        height: 300, 
                        border: '2px dashed #cbd5e1', 
                        borderRadius: 4, 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: '#f8fafc',
                        mb: 4,
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    {previewUrl ? (
                        <Box component="img" src={previewUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <>
                            <CameraAlt sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                            <Typography color="text.secondary">Chưa có ảnh nào được chọn</Typography>
                        </>
                    )}
                </Box>

                <input 
                    type="file" 
                    accept="image/*" 
                    capture="user" 
                    hidden 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                />

                <Box display="flex" gap={2} justifyContent="center">
                    <Button 
                        variant="outlined" 
                        size="large"
                        startIcon={<CameraAlt />}
                        onClick={() => fileInputRef.current.click()}
                        disabled={loading}
                    >
                        {previewUrl ? 'Chụp lại' : 'Mở Camera'}
                    </Button>

                    <Button 
                        variant="contained" 
                        size="large"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                        onClick={handleUpload}
                        disabled={!selectedFile || loading}
                        disableElevation
                    >
                        {loading ? 'Đang tải lên...' : 'Gửi Phê Duyệt'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
