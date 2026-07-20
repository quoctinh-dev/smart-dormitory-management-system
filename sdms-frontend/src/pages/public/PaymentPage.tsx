import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PaymentIcon from '@mui/icons-material/Payment';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Divider,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { usePayment } from '@/hooks/usePayment';

export default function PaymentPage() {
    const { applicationId } = useParams();
    const [paymentQrUrl, setPaymentQrUrl] = useState<string | null>(null);

    const { bill, application, paymentInstructions, loading, paying, handleOnlinePayment } =
        usePayment(applicationId || '');

    const qrDetails = useMemo(() => {
        if (!paymentQrUrl) return null;
        try {
            const url = new URL(paymentQrUrl);
            return {
                bank: url.searchParams.get('bank') || 'Ngân hàng',
                acc: url.searchParams.get('acc') || '',
                amount: url.searchParams.get('amount') || '',
                des: url.searchParams.get('des') || '',
            };
        } catch (e) {
            return null;
        }
    }, [paymentQrUrl]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (loading) return <CustomSkeleton type="dashboard" count={1} />;

    const transferContent =
        typeof (paymentInstructions as any)?.contentPrefix === 'string' && typeof bill?.billId === 'string'
            ? `${(paymentInstructions as any).contentPrefix}${bill.billId.split('-')[0].toUpperCase()}`
            : '';

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 4, md: 5 },
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.02)'
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px', mb: 1.5 }}>
                        Thanh toán phí nội trú
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxW: 480, mx: 'auto', lineHeight: 1.6 }}>
                        Hoàn tất nghĩa vụ tài chính để hệ thống tự động xác nhận giường ở chính thức và kích hoạt quyền truy cập ứng dụng.
                    </Typography>
                </Box>

                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ p: 3, borderRadius: 4, bgcolor: 'background.elevation1', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', color: 'text.secondary' }}>
                                Thông tin sinh viên
                            </Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Họ và tên</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{application?.fullName}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Mã số định danh (CCCD)</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{application?.cccd}</Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ p: 3, borderRadius: 4, bgcolor: 'background.elevation1', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', color: 'text.secondary' }}>
                                Chi tiết hóa đơn
                            </Typography>
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Mã hóa đơn:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{bill?.billId}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Nội dung:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{bill?.description}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Hạn nộp phí:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
                                        {bill?.dueDate ? new Date(bill.dueDate).toLocaleDateString('vi-VN') : ''}
                                    </Typography>
                                </Stack>
                                <Divider sx={{ my: 0.5 }} />
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body1" sx={{ fontWeight: 700 }}>Tổng tiền:</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                        {bill?.amount ? bill.amount.toLocaleString('vi-VN') : 0} VNĐ
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>

                {paymentInstructions && (
                    <Box
                        sx={{
                            p: 3.5,
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: 'success.light',
                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.02),
                            mb: 4,
                            textAlign: 'left'
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.dark', mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Hướng dẫn chuyển khoản ngân hàng
                        </Typography>

                        <Stack spacing={2} sx={{ mb: 3 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>Ngân hàng nhận:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{paymentInstructions.bankName}</Typography>
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>Số tài khoản:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>{paymentInstructions.accountNumber}</Typography>
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>Tên thụ hưởng:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN</Typography>
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>Nội dung mẫu:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Họ tên sinh viên, MSSV, HK, Năm học (VD: NGUYEN VAN A, {application?.studentCode || 'MSSV...'}, HỌC KỲ 3 2025-2026)
                                </Typography>
                            </Stack>
                        </Stack>

                        <Box
                            sx={(theme) => ({
                                p: 2.5,
                                bgcolor: alpha(theme.palette.warning.main, 0.08),
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'warning.light'
                            })}
                        >
                            <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 700, mb: 1 }}>
                                Cú pháp bắt buộc để xác nhận tự động (SEPAY)
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary', mb: 2, lineHeight: 1.5 }}>
                                Để cổng kết nối tự động gạch nợ hóa đơn, trong chuỗi nội dung chuyển khoản của bạn <strong>bắt buộc phải điền chính xác cụm mã sau</strong>:
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', width: 'fit-content' }}>
                                <Typography variant="body1" sx={{ fontWeight: 800, color: 'error.main', letterSpacing: '0.5px' }}>
                                    {transferContent}
                                </Typography>
                                <Tooltip title="Sao chép mã định danh">
                                    <IconButton size="small" onClick={() => handleCopy(transferContent)}>
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>

                        {paymentInstructions.qrCodeUrl && (
                            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ mb: 2, fontWeight: 700, color: 'text.secondary' }}>
                                    Quét nhanh mã QR cấu hình sẵn của nhà trường
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 4,
                                        bgcolor: 'common.white',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                                    }}
                                >
                                    <img
                                        src={paymentInstructions.qrCodeUrl}
                                        alt="Mã QR Trường cung cấp"
                                        style={{ maxWidth: '200px', height: 'auto', display: 'block' }}
                                    />
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}

                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    color="primary"
                    startIcon={paying ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                    onClick={async () => {
                        const url = await handleOnlinePayment('BANK_TRANSFER');
                        if (url) setPaymentQrUrl(url);
                    }}
                    disabled={paying}
                    sx={{
                        py: 1.6,
                        fontSize: '1rem',
                        borderRadius: 3,
                        fontWeight: 700,
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none' }
                    }}
                >
                    {paying ? 'Đang khởi tạo liên kết...' : 'Tạo mã QR trực tuyến thông minh'}
                </Button>
            </Paper>

            <Dialog
                open={!!paymentQrUrl}
                onClose={() => setPaymentQrUrl(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, overflow: 'hidden' },
                }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Cổng xử lý thanh toán tự động
                    </Typography>
                    <IconButton onClick={() => setPaymentQrUrl(null)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 0, bgcolor: 'background.elevation1' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }}>
                        <Box
                            sx={{
                                flex: 1,
                                p: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRight: { md: '1px solid' },
                                borderColor: { md: 'divider' },
                                bgcolor: 'background.paper',
                            }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                                Quét ứng dụng ngân hàng
                            </Typography>
                            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                                Mở app ngân hàng quét mã QR để tự động điền giá trị và nội dung giao dịch
                            </Typography>

                            <Box
                                sx={{
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 4,
                                    bgcolor: 'common.white',
                                    width: 240,
                                    height: 240,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                                }}
                            >
                                {paymentQrUrl && (
                                    <img
                                        src={paymentQrUrl}
                                        alt="Mã QR Cổng Thanh Toán"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                )}
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, p: 4 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                                Sao chép dữ liệu thủ công
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Nhấp nút sao chép bên phải khi thực hiện các tác vụ chuyển khoản rời
                            </Typography>

                            {qrDetails && (
                                <Stack spacing={2.5}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                            Ngân hàng thụ hưởng
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{qrDetails.bank}</Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                            Đơn vị tiếp nhận tài chính
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN</Typography>
                                    </Box>

                                    <Stack direction="row" justifyContent="between" alignItems="center" sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Số tài khoản đích</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>{qrDetails.acc}</Typography>
                                        </Box>
                                        <Tooltip title="Sao chép số tài khoản">
                                            <IconButton size="small" onClick={() => handleCopy(qrDetails.acc)}>
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>

                                    <Stack direction="row" justifyContent="between" alignItems="center" sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Số tiền thanh toán</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main' }}>
                                                {parseInt(qrDetails.amount).toLocaleString('vi-VN')} VNĐ
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Sao chép số tiền">
                                            <IconButton size="small" onClick={() => handleCopy(qrDetails.amount)}>
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>

                                    <Stack direction="row" justifyContent="between" alignItems="center" sx={{ bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08), p: 2, borderRadius: 3, border: '1px solid', borderColor: 'warning.light' }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="caption" sx={{ color: 'warning.dark', display: 'block', fontWeight: 700, mb: 0.5 }}>
                                                Nội dung giao dịch chính xác
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 800, color: 'error.main', letterSpacing: '0.5px' }}>
                                                {qrDetails.des}
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Sao chép nội dung">
                                            <IconButton size="small" onClick={() => handleCopy(qrDetails.des)}>
                                                <ContentCopyIcon fontSize="small" color="warning" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setPaymentQrUrl(null)} variant="outlined" color="inherit" sx={{ borderRadius: 2.5, px: 3 }}>
                        Quay lại
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}