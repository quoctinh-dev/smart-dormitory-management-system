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
    Snackbar,
    Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {alpha} from '@mui/material/styles';
import {useState, useMemo} from 'react';
import {useParams} from 'react-router-dom';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import {usePayment} from '@/hooks/usePayment';

export default function PaymentPage() {
    const {applicationId} = useParams();
    const [paymentQrUrl, setPaymentQrUrl] = useState<string | null>(null);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const {bill, application, paymentInstructions, loading, paying, handleOnlinePayment} =
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

    const handleCopy = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setToastMessage(`Đã sao chép ${label}!`);
        setToastOpen(true);
    };

    if (loading) return <CustomSkeleton type="dashboard" count={1}/>;

    const transferContent =
        typeof (paymentInstructions as any)?.contentPrefix === 'string' && typeof bill?.billId === 'string'
            ? `${(paymentInstructions as any).contentPrefix}${bill.billId.split('-')[0].toUpperCase()}`
            : '';

    return (
        <Container maxWidth="md" sx={{py: {xs: 4, md: 8}}}>
            <Paper
                variant="outlined"
                sx={{
                    p: {xs: 2.5, sm: 3, md: 5},
                    borderRadius: 2,
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                }}
            >
                {/* --- HEADER --- */}
                <Box sx={{textAlign: 'center', mb: {xs: 4, md: 5}}}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '-0.5px',
                            mb: 1.5,
                            fontSize: {xs: '1.5rem', md: '1.75rem'}
                        }}
                    >
                        Thanh toán phí nội trú
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            maxWidth: 520,
                            mx: 'auto',
                            lineHeight: 1.6,
                            fontSize: {xs: '0.875rem', md: '0.95rem'}
                        }}
                    >
                        Hoàn tất nghĩa vụ tài chính để hệ thống tự động xác nhận giường ở chính thức và kích hoạt quyền
                        truy cập ứng dụng.
                    </Typography>
                </Box>

                {/* --- STUDENT INFO & BILL DETAILS --- */}
                <Grid container spacing={{xs: 2, md: 3}} sx={{mb: {xs: 4, md: 5}}}>
                    {/* Thông tin sinh viên */}
                    <Grid size={{xs: 12, md: 6}}>
                        <Box
                            sx={{
                                p: {xs: 2, md: 2.5},
                                borderRadius: 1.5,
                                bgcolor: 'background.default',
                                border: '1px solid',
                                borderColor: 'divider',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 700,
                                    mb: 2,
                                    textTransform: 'uppercase',
                                    color: 'text.secondary',
                                    fontSize: '0.75rem',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                Thông tin sinh viên
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                        sx={{mb: 0.5, fontWeight: 600}}
                                    >
                                        Họ và tên
                                    </Typography>
                                    <Typography variant="body2" sx={{fontWeight: 600}}>
                                        {application?.fullName}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                        sx={{mb: 0.5, fontWeight: 600}}
                                    >
                                        Mã số định danh (CCCD)
                                    </Typography>
                                    <Typography variant="body2" sx={{fontWeight: 600}}>
                                        {application?.cccd}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Grid>

                    {/* Chi tiết hóa đơn */}
                    <Grid size={{xs: 12, md: 6}}>
                        <Box
                            sx={{
                                p: {xs: 2, md: 2.5},
                                borderRadius: 1.5,
                                bgcolor: 'background.default',
                                border: '1px solid',
                                borderColor: 'divider',
                                height: '100%'
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 700,
                                    mb: 2,
                                    textTransform: 'uppercase',
                                    color: 'text.secondary',
                                    fontSize: '0.75rem',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                Chi tiết hóa đơn
                            </Typography>
                            <Stack spacing={1}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary"
                                                sx={{fontWeight: 600, display: 'block', mb: 0.25}}>
                                        Mã hóa đơn
                                    </Typography>
                                    <Typography variant="body2" sx={{fontWeight: 600}}>
                                        {bill?.billId}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary"
                                                sx={{fontWeight: 600, display: 'block', mb: 0.25}}>
                                        Nội dung
                                    </Typography>
                                    <Typography variant="body2" sx={{fontWeight: 600}}>
                                        {bill?.description}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary"
                                                sx={{fontWeight: 600, display: 'block', mb: 0.25}}>
                                        Hạn nộp phí
                                    </Typography>
                                    <Typography variant="body2" sx={{fontWeight: 600, color: 'error.main'}}>
                                        {bill?.dueDate ? new Date(bill.dueDate).toLocaleDateString('vi-VN') : ''}
                                    </Typography>
                                </Box>
                                <Divider sx={{my: 1}}/>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" sx={{fontWeight: 600}}>
                                        Tổng tiền
                                    </Typography>
                                    <Typography variant="h6" sx={{fontWeight: 800, color: 'primary.main'}}>
                                        {bill?.amount ? bill.amount.toLocaleString('vi-VN') : 0} VNĐ
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>

                {/* --- PAYMENT INSTRUCTIONS --- */}
                {paymentInstructions && (
                    <Box
                        sx={{
                            p: {xs: 2, md: 3},
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.02),
                            mb: {xs: 4, md: 5}
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                color: 'success.dark',
                                mb: 2.5,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontSize: '0.95rem'
                            }}
                        >
                            Hướng dẫn chuyển khoản ngân hàng
                        </Typography>

                        <Stack spacing={1.5} sx={{mb: 3}}>
                            <Stack direction={{xs: 'column', sm: 'row'}} spacing={{xs: 1, sm: 2}}
                                   alignItems={{xs: 'flex-start', sm: 'center'}}>
                                <Typography variant="body2" color="text.secondary"
                                            sx={{fontWeight: 600, minWidth: {sm: 140}, flexShrink: 0}}>
                                    Ngân hàng nhận:
                                </Typography>
                                <Typography variant="body2" sx={{fontWeight: 600}}>
                                    {paymentInstructions.bankName}
                                </Typography>
                            </Stack>
                            <Stack direction={{xs: 'column', sm: 'row'}} spacing={{xs: 1, sm: 2}}
                                   alignItems={{xs: 'flex-start', sm: 'center'}}>
                                <Typography variant="body2" color="text.secondary"
                                            sx={{fontWeight: 600, minWidth: {sm: 140}, flexShrink: 0}}>
                                    Số tài khoản:
                                </Typography>
                                <Typography variant="body2" sx={{fontWeight: 700, color: 'error.main'}}>
                                    {paymentInstructions.accountNumber}
                                </Typography>
                            </Stack>
                            <Stack direction={{xs: 'column', sm: 'row'}} spacing={{xs: 1, sm: 2}}
                                   alignItems={{xs: 'flex-start', sm: 'center'}}>
                                <Typography variant="body2" color="text.secondary"
                                            sx={{fontWeight: 600, minWidth: {sm: 140}, flexShrink: 0}}>
                                    Tên thụ hưởng:
                                </Typography>
                                <Typography variant="body2" sx={{fontWeight: 600}}>
                                    TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN
                                </Typography>
                            </Stack>
                            <Stack direction={{xs: 'column', sm: 'row'}} spacing={{xs: 1, sm: 2}}
                                   alignItems={{xs: 'flex-start', sm: 'center'}}>
                                <Typography variant="body2" color="text.secondary"
                                            sx={{fontWeight: 600, minWidth: {sm: 140}, flexShrink: 0}}>
                                    Nội dung mẫu:
                                </Typography>
                                <Typography variant="body2" sx={{fontWeight: 500, lineHeight: 1.5}}>
                                    Họ tên sinh viên, MSSV, HK, Năm học (VD: NGUYEN VAN
                                    A, {application?.studentCode || 'MSSV...'}, HỌC KỲ 3 2025-2026)
                                </Typography>
                            </Stack>
                        </Stack>

                        {/* Syntax requirement box */}
                        <Box
                            sx={(theme) => ({
                                p: 2,
                                bgcolor: alpha(theme.palette.warning.main, 0.08),
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'warning.light'
                            })}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'warning.dark',
                                    fontWeight: 700,
                                    mb: 1.5,
                                    fontSize: '0.9rem'
                                }}
                            >
                                ⚠ Cú pháp bắt buộc để xác nhận tự động (SEPAY)
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.primary',
                                    mb: 1.5,
                                    lineHeight: 1.6,
                                    fontSize: '0.875rem'
                                }}
                            >
                                Để cổng kết nối tự động gạch nợ hóa đơn, trong chuỗi nội dung chuyển khoản của
                                bạn <strong>bắt buộc phải điền chính xác cụm mã sau</strong>:
                            </Typography>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{
                                    bgcolor: 'background.paper',
                                    p: 1.5,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    width: 'fit-content'
                                }}
                            >
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontWeight: 800,
                                        color: 'error.main',
                                        letterSpacing: '1px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {transferContent}
                                </Typography>
                                <Tooltip title="Sao chép">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleCopy(transferContent, 'Mã định danh')}
                                        sx={{ml: 0.5}}
                                    >
                                        <ContentCopyIcon fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>

                        {/* QR Code */}
                        {paymentInstructions.qrCodeUrl && (
                            <Box sx={{mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider'}}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mb: 2,
                                        fontWeight: 700,
                                        color: 'text.secondary',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Mã QR từ nhà trường
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1.5,
                                        bgcolor: 'common.white',
                                    }}
                                >
                                    <img
                                        src={paymentInstructions.qrCodeUrl}
                                        alt="Mã QR Trường cung cấp"
                                        style={{maxWidth: '160px', height: 'auto', display: 'block'}}
                                    />
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}

                {/* --- CTA BUTTON --- */}
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    color="primary"
                    startIcon={paying ? <CircularProgress size={20} color="inherit"/> : <PaymentIcon/>}
                    onClick={async () => {
                        const url = await handleOnlinePayment('BANK_TRANSFER');
                        if (url) setPaymentQrUrl(url);
                    }}
                    disabled={paying}
                    disableElevation
                    sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        borderRadius: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        letterSpacing: '0.3px'
                    }}
                >
                    {paying ? 'Đang khởi tạo...' : 'Tạo mã QR trực tuyến'}
                </Button>
            </Paper>

            {/* --- PAYMENT MODAL DIALOG --- */}
            <Dialog
                open={!!paymentQrUrl}
                onClose={() => setPaymentQrUrl(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    variant: 'outlined',
                    sx: {borderRadius: 2, overflow: 'hidden'}
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
                    <Typography variant="h6" sx={{fontWeight: 700, fontSize: '1.1rem'}}>
                        Thanh toán trực tuyến
                    </Typography>
                    <IconButton onClick={() => setPaymentQrUrl(null)} size="small">
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: {xs: 2, sm: 3}, bgcolor: 'background.default'}}>
                    <Stack direction="column" spacing={2.5}>
                        {/* QR Code Block */}
                        <Box
                            sx={{
                                p: 2.5,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1.5,
                                bgcolor: 'background.paper',
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 700,
                                    mb: 0.5,
                                    color: 'primary.main',
                                    fontSize: '0.95rem'
                                }}
                            >
                                Quét mã nhanh
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                textAlign="center"
                                sx={{
                                    mb: 2,
                                    lineHeight: 1.5,
                                    fontSize: '0.8rem'
                                }}
                            >
                                Sử dụng QR Pay trên ứng dụng ngân hàng
                            </Typography>

                            <Box
                                sx={{
                                    p: 1.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1.5,
                                    bgcolor: 'common.white',
                                    width: '100%',
                                    maxWidth: 200,
                                    aspectRatio: '1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {paymentQrUrl && (
                                    <img
                                        src={paymentQrUrl}
                                        alt="Mã QR thanh toán"
                                        style={{width: '100%', height: '100%', objectFit: 'contain'}}
                                    />
                                )}
                            </Box>
                        </Box>

                        {/* Payment Details Block */}
                        <Box
                            sx={{
                                p: 2.5,
                                bgcolor: 'background.paper',
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 700,
                                    mb: 0.5,
                                    color: 'primary.main',
                                    fontSize: '0.95rem'
                                }}
                            >
                                Thông tin chuyển khoản
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    mb: 2,
                                    display: 'block',
                                    lineHeight: 1.5,
                                    fontSize: '0.8rem'
                                }}
                            >
                                Nhấp sao chép để đảm bảo thông tin chính xác
                            </Typography>

                            {qrDetails && (
                                <Stack spacing={1.5}>
                                    {/* Bank & Beneficiary */}
                                    <Grid container spacing={1.5}>
                                        <Grid size={{xs: 12, sm: 6}}>
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        mb: 0.5,
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    Ngân hàng
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    {qrDetails.bank}
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Grid size={{xs: 12, sm: 6}}>
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        mb: 0.5,
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    Thụ hưởng
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        wordBreak: 'break-word',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    {/* Account Number */}
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        spacing={1}
                                        sx={{
                                            bgcolor: 'background.default',
                                            p: 1.25,
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Box sx={{flex: 1, minWidth: 0}}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: 'block',
                                                    mb: 0.25,
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                Số tài khoản
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: 'primary.main',
                                                    wordBreak: 'break-all',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {qrDetails.acc}
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Sao chép">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCopy(qrDetails.acc, 'Số tài khoản')}
                                                sx={{flexShrink: 0}}
                                            >
                                                <ContentCopyIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>

                                    {/* Amount */}
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        spacing={1}
                                        sx={{
                                            bgcolor: 'background.default',
                                            p: 1.25,
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Box sx={{flex: 1, minWidth: 0}}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: 'block',
                                                    mb: 0.25,
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                Số tiền
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: 'error.main',
                                                    wordBreak: 'break-all',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {parseInt(qrDetails.amount).toLocaleString('vi-VN')} VNĐ
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Sao chép">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCopy(qrDetails.amount, 'Số tiền')}
                                                sx={{flexShrink: 0}}
                                            >
                                                <ContentCopyIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>

                                    {/* Transfer Content (Required) */}
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        spacing={1}
                                        sx={{
                                            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
                                            p: 1.25,
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'warning.light'
                                        }}
                                    >
                                        <Box sx={{flex: 1, minWidth: 0}}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'warning.dark',
                                                    display: 'block',
                                                    fontWeight: 700,
                                                    mb: 0.25,
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                Nội dung (bắt buộc)
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: 'error.main',
                                                    letterSpacing: '0.5px',
                                                    wordBreak: 'break-all',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {qrDetails.des}
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Sao chép">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCopy(qrDetails.des, 'Nội dung chuyển khoản')}
                                                sx={{flexShrink: 0}}
                                            >
                                                <ContentCopyIcon fontSize="small" color="warning"/>
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{p: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1}}>
                    <Button
                        onClick={() => setPaymentQrUrl(null)}
                        variant="outlined"
                        color="inherit"
                        disableElevation
                        sx={{
                            borderRadius: 1.5,
                            px: 2.5,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Thông báo sao chép thành công */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={3000}
                onClose={() => setToastOpen(false)}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                <Alert onClose={() => setToastOpen(false)} severity="success" variant="filled" sx={{width: '100%'}}>
                    {toastMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}