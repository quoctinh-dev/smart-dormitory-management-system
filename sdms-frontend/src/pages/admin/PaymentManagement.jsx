import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axiosClient from "@/api/axiosClient";

export default function PaymentManagement() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [detailsDialog, setDetailsDialog] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const res = await axiosClient.get('/v1/bills');
                setBills(res.data || res);
            } catch (err) {
                console.error("Failed to fetch bills", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, []);

    const handleConfirmCashPayment = async () => {
        if (!selectedBill) return;
        try {
            await axiosClient.post('/payments/cash/approve', {
                billId: selectedBill.billId,
                amount: selectedBill.amount
            });
            setBills(prev => prev.map(b => b.billId === selectedBill.billId ? { ...b, status: "PAID" } : b));
            setConfirmDialog(false);
            alert(`Đã thu tiền mặt thành công cho hóa đơn ${selectedBill.billCode}. Hệ thống đang khởi tạo tài khoản cho sinh viên.`);
        } catch (error) {
            console.error("Payment failed", error);
            alert("Lỗi thu tiền: " + (error.response?.data?.message || error.message));
        }
    };

    const handleViewDetails = (bill) => {
        setSelectedBill(bill);
        setDetailsDialog(true);
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={1}>Quản lý Thanh toán</Typography>
            <Typography color="text.secondary" mb={4}>Theo dõi hóa đơn và thu tiền mặt trực tiếp</Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell><b>Mã Hóa Đơn</b></TableCell>
                                <TableCell><b>Sinh viên</b></TableCell>
                                <TableCell><b>Loại phí</b></TableCell>
                                <TableCell><b>Số tiền (VNĐ)</b></TableCell>
                                <TableCell><b>Trạng thái</b></TableCell>
                                <TableCell><b>Hành động</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bills.map(bill => (
                                <TableRow key={bill.billId} hover>
                                    <TableCell>{bill.billCode}</TableCell>
                                    <TableCell>{bill.studentName}</TableCell>
                                    <TableCell>
                                        <Chip label={bill.billType || "FEE"} size="small" color="primary" variant="outlined" />
                                    </TableCell>
                                    <TableCell fontWeight="bold">{bill.amount?.toLocaleString('vi-VN') || 0}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={bill.status} 
                                            color={bill.status === 'PAID' ? 'success' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton color="info" onClick={() => handleViewDetails(bill)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                        {bill.status === 'UNPAID' && (
                                            <Button 
                                                variant="contained" 
                                                size="small" 
                                                color="success"
                                                startIcon={<CheckCircleIcon />}
                                                onClick={() => { setSelectedBill(bill); setConfirmDialog(true); }}
                                                sx={{ ml: 1, textTransform: 'none' }}
                                            >
                                                Thu tiền mặt
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Confirm Dialog */}
            <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
                <DialogTitle>Xác nhận thu tiền mặt</DialogTitle>
                <DialogContent>
                    Xác nhận đã nhận đủ <b>{selectedBill?.amount?.toLocaleString('vi-VN')} VNĐ</b> từ sinh viên <b>{selectedBill?.studentName}</b>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog(false)}>Hủy</Button>
                    <Button variant="contained" color="success" onClick={handleConfirmCashPayment}>Xác nhận Thu Tiền</Button>
                </DialogActions>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Chi tiết Hóa đơn</DialogTitle>
                <DialogContent dividers>
                    {selectedBill && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Mã Hóa đơn (ID):</Typography>
                                <Typography fontWeight="bold">{selectedBill.billId}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Sinh viên:</Typography>
                                <Typography fontWeight="bold">{selectedBill.studentName}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Loại phí:</Typography>
                                <Typography fontWeight="bold">{selectedBill.billType}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Hạn thanh toán:</Typography>
                                <Typography fontWeight="bold" color="error">{selectedBill.dueDate ? new Date(selectedBill.dueDate).toLocaleDateString('vi-VN') : 'Không có'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 2, borderTop: '1px dashed #ccc' }}>
                                <Typography variant="h6">Tổng tiền:</Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">{selectedBill.amount?.toLocaleString('vi-VN')} VNĐ</Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsDialog(false)} variant="contained" color="primary">Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
