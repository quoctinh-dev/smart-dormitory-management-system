import { Container, Paper, Typography, Box, Button, Divider, Alert, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosClient from "@/api/axiosClient";
import PaymentIcon from '@mui/icons-material/Payment';

export default function PaymentPage() {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Application info
                const appRes = await axiosClient.get(`/v1/applications/${applicationId}`);
                setApplication(appRes.data || appRes);

                // Fetch Bill info
                const billRes = await axiosClient.get(`/v1/bills/application/${applicationId}`);
                setBill(billRes.data || billRes);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Không tìm thấy thông tin hóa đơn cho hồ sơ này.");
                setLoading(false);
            }
        };
        fetchData();
    }, [applicationId]);

    const handleMockPayment = async () => {
        setPaying(true);
        try {
            // Giả lập Webhook payment success
            await axiosClient.post(`/payments/mock-success`, { applicationId });
            alert("Thanh toán thành công! Hệ thống đang tạo tài khoản cho bạn.");
            navigate('/status');
        } catch (err) {
            alert("Lỗi thanh toán: " + (err.response?.data?.message || err.message));
        } finally {
            setPaying(false);
        }
    };

    if (loading) return <Container sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 10 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                    Thanh Toán Lệ Phí
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                    Vui lòng hoàn tất thanh toán để hệ thống tự động cấp phòng và tạo tài khoản sinh viên nội trú cho bạn.
                </Typography>

                <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 3, textAlign: 'left', mb: 4 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>Thông tin sinh viên</Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}><Typography color="text.secondary">Họ và tên:</Typography></Grid>
                        <Grid size={{ xs: 6 }}><Typography fontWeight="bold" align="right">{application.fullName}</Typography></Grid>
                        
                        <Grid size={{ xs: 6 }}><Typography color="text.secondary">CCCD:</Typography></Grid>
                        <Grid size={{ xs: 6 }}><Typography fontWeight="bold" align="right">{application.cccd}</Typography></Grid>
                    </Grid>
                </Box>

                <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 3, textAlign: 'left', mb: 4 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>Thông tin thanh toán</Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}><Typography color="text.secondary">Mã hóa đơn:</Typography></Grid>
                        <Grid size={{ xs: 6 }}><Typography fontWeight="bold" align="right">{bill.billId}</Typography></Grid>
                        
                        <Grid size={{ xs: 6 }}><Typography color="text.secondary">Nội dung:</Typography></Grid>
                        <Grid size={{ xs: 6 }}><Typography fontWeight="bold" align="right">{bill.description}</Typography></Grid>
                        
                        <Grid size={{ xs: 6 }}><Typography color="text.secondary">Hạn chót:</Typography></Grid>
                        <Grid size={{ xs: 6 }}><Typography fontWeight="bold" align="right" color="error">{new Date(bill.dueDate).toLocaleDateString('vi-VN')}</Typography></Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Grid container>
                        <Grid size={{ xs: 6 }}><Typography variant="h6">Tổng tiền:</Typography></Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="h6" fontWeight="bold" align="right" color="primary">
                                {bill.amount.toLocaleString('vi-VN')} VNĐ
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                <Button 
                    variant="contained" 
                    size="large" 
                    fullWidth 
                    color="warning"
                    startIcon={paying ? <CircularProgress size={20} color="inherit"/> : <PaymentIcon />}
                    onClick={handleMockPayment}
                    disabled={paying}
                    sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2, mb: 2 }}
                >
                    {paying ? "Đang xử lý..." : "Mô phỏng Đóng Tiền (Bỏ qua bước VNPay)"}
                </Button>
                
                <Typography variant="body2" color="text.secondary">
                    *Ghi chú: Nút này hiện để Test nhanh luồng tự động tạo Tài Khoản (Event-Driven) của hệ thống. 
                    Trong thực tế, bạn sẽ thanh toán VNPay tại đây, hoặc đến văn phòng KTX nộp tiền mặt để Admin xác nhận.
                </Typography>
            </Paper>
        </Container>
    );
}
