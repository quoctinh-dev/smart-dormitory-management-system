import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import {
    Container,
    Paper,
    Fade,
    Box,
    Typography,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Stack,
    InputAdornment,
} from '@mui/material';
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import { useApplicationStatus } from '@/hooks/useApplicationStatus';
import ApplicationInfo from '@/pages/public/components/Status/ApplicationInfo';
import AssignmentInfo from '@/pages/public/components/Status/AssignmentInfo';
import StatusIndicator from '@/pages/public/components/Status/StatusIndicator';

export default function StatusPage() {
    const navigate = useNavigate();
    const [studentCode, setStudentCode] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [paymentQrUrl, setPaymentQrUrl] = useState<string | null>(null);

    const {
        application,
        loading,
        paymentLoading,
        uploadingDocId,
        fetchStatus,
        handleOnlinePayment,
        handleResubmit,
    } = useApplicationStatus();

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

    const handleStudentCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        setStudentCode(rawValue);
        if (hasSearched) setHasSearched(false);
    };

    const handleSearch = useCallback(() => {
        const cleanStudentCode = studentCode.trim();
        if (!cleanStudentCode) return;

        setHasSearched(true);
        fetchStatus(cleanStudentCode);
    }, [studentCode, fetchStatus]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const isBtnDisabled = useMemo(() => loading || !studentCode, [loading, studentCode]);

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Fade in timeout={800}>
                <Paper
                    elevation={0}
                    sx={(theme) => ({
                        borderRadius: 6,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.15),
                        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.08)}`,
                        bgcolor: 'background.paper'
                    })}
                >
                    <Box
                        sx={(theme) => ({
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                            color: 'common.white',
                            py: 5,
                            px: 3,
                            textAlign: 'center',
                        })}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                lineHeight: 1.3,
                                color: 'inherit',
                                mb: 1.5
                            }}
                        >
                            Tra cứu tiến độ hồ sơ
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'inherit',
                                opacity: 0.9,
                                fontWeight: 500,
                                maxWidth: 460,
                                mx: 'auto',
                                lineHeight: 1.6
                            }}
                        >
                            Nhập mã số sinh viên cá nhân để kiểm tra trạng thái phê duyệt và vị trí xếp phòng nội trú của bạn.
                        </Typography>
                    </Box>

                    <Box sx={{ p: { xs: 4, md: 6 } }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4, alignItems: 'stretch' }}>
                            <TextField
                                fullWidth
                                label="Mã số sinh viên"
                                variant="outlined"
                                value={studentCode}
                                onChange={handleStudentCodeChange}
                                onKeyDown={handleKeyDown}
                                helperText="Vui lòng nhập chính xác MSSV được nhà trường cấp"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 3,
                                            bgcolor: 'background.paper'
                                        }
                                    },
                                    formHelperText: {
                                        sx: { mt: 0.8, ml: 1 }
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleSearch}
                                disabled={isBtnDisabled}
                                sx={{
                                    minWidth: 140,
                                    height: 56,
                                    borderRadius: 3,
                                    fontWeight: 700,
                                    boxShadow: 'none',
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    '&:hover': { boxShadow: 'none' }
                                }}
                            >
                                {loading ? 'Đang tra...' : 'Tra cứu hồ sơ'}
                            </Button>
                        </Stack>

                        {loading ? (
                            <CustomSkeleton type="list" count={3} />
                        ) : application ? (
                            <Fade in timeout={400}>
                                <Box>
                                    <StatusIndicator status={application.status} />

                                    {application.assignment && (
                                        <AssignmentInfo
                                            assignment={application.assignment}
                                            applicationStatus={application.status}
                                        />
                                    )}

                                    {application.status === 'WAITING_LIST' && (
                                        <Box
                                            sx={(theme) => ({
                                                mb: 4,
                                                p: 2.5,
                                                pl: 3,
                                                bgcolor: alpha(theme.palette.info.main, 0.04),
                                                borderLeft: '4px solid',
                                                borderColor: 'info.main',
                                                borderRadius: '0 12px 12px 0',
                                            })}
                                        >
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                Hiện tại số lượng chỗ ở trong danh mục phân bổ tạm thời đã đầy. Hồ sơ tự động được chuyển vào <strong>Danh sách chờ</strong>. Hệ thống sẽ quét duyệt theo thứ tự ưu tiên ngay khi có phòng trống mới được cập nhật.
                                            </Typography>
                                        </Box>
                                    )}

                                    {application.status === 'REJECTED' && (
                                        <Box
                                            sx={(theme) => ({
                                                mb: 4,
                                                p: 2.5,
                                                pl: 3,
                                                bgcolor: alpha(theme.palette.error.main, 0.04),
                                                borderLeft: '4px solid',
                                                borderColor: 'error.main',
                                                borderRadius: '0 12px 12px 0',
                                            })}
                                        >
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                Hồ sơ từ chối tiếp nhận với lý do: <strong>{application.reviewNote || 'Không đạt tiêu chí xét duyệt đợt này.'}</strong>
                                            </Typography>
                                        </Box>
                                    )}

                                    <ApplicationInfo
                                        application={application}
                                        documents={application.documents}
                                        uploadingDocId={uploadingDocId}
                                        handleResubmit={handleResubmit}
                                    />

                                    {application.status === 'WAITING_PAYMENT' && application.bill && (
                                        <Box
                                            sx={{
                                                mt: 4,
                                                p: 4,
                                                borderRadius: 4,
                                                border: '1px solid',
                                                borderColor: 'primary.light',
                                                textAlign: 'center',
                                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02)
                                            }}
                                        >
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                disabled={paymentLoading}
                                                onClick={async () => {
                                                    const url = await handleOnlinePayment('BANK_TRANSFER');
                                                    if (url) setPaymentQrUrl(url);
                                                }}
                                                sx={{
                                                    px: 4,
                                                    py: 1.8,
                                                    fontSize: '1rem',
                                                    borderRadius: 3,
                                                    fontWeight: 700,
                                                    boxShadow: 'none',
                                                    '&:hover': { boxShadow: 'none' }
                                                }}
                                            >
                                                {paymentLoading
                                                    ? 'Đang tạo dữ liệu...'
                                                    : `Xuất mã QR thanh toán - ${application.bill.amount.toLocaleString('vi-VN')}đ`}
                                            </Button>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                                Hệ thống tự động liên kết tạo cổng thanh toán trực tuyến bảo mật.
                                            </Typography>
                                        </Box>
                                    )}

                                    {application.status === 'APPROVED' && (
                                        <Box
                                            sx={{
                                                mt: 4,
                                                p: 4,
                                                bgcolor: (theme) => alpha(theme.palette.success.main, 0.02),
                                                borderRadius: 4,
                                                textAlign: 'center',
                                                border: '1px solid',
                                                borderColor: 'success.light'
                                            }}
                                        >
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'success.dark' }}>
                                                Xác nhận hoàn tất thủ tục tài chính
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6, color: 'text.primary' }}>
                                                Vui lòng mang theo căn cước công dân bản gốc đến trực tiếp Văn phòng Ban quản lý KTX STU để hoàn thành bước tiếp nhận phòng ở.
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                                                Thông tin tài khoản cư dân nội trú của bạn đã sẵn sàng trên hệ thống.
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="large"
                                                onClick={() => navigate('/activate-account')}
                                                sx={{
                                                    fontWeight: 700,
                                                    px: 4,
                                                    py: 1.6,
                                                    borderRadius: 3,
                                                    boxShadow: 'none',
                                                    '&:hover': { boxShadow: 'none' }
                                                }}
                                            >
                                                Kích hoạt tài khoản cư dân ngay
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </Fade>
                        ) : (
                            hasSearched && (
                                <Fade in>
                                    <Box
                                        sx={(theme) => ({
                                            mt: 2,
                                            p: 2.5,
                                            pl: 3,
                                            bgcolor: alpha(theme.palette.warning.main, 0.04),
                                            borderLeft: '4px solid',
                                            borderColor: 'warning.main',
                                            borderRadius: '0 12px 12px 0',
                                        })}
                                    >
                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                            Không tìm thấy thông tin hồ sơ lưu trú tương ứng với mã số sinh viên vừa cung cấp.
                                        </Typography>
                                    </Box>
                                </Fade>
                            )
                        )}
                    </Box>
                </Paper>
            </Fade>

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
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Thông tin thanh toán trực tuyến
                    </Typography>
                    <IconButton onClick={() => setPaymentQrUrl(null)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
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
                                Quét mã nhanh qua Ứng dụng Bank
                            </Typography>
                            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                                Sử dụng tính năng QR Pay trên ứng dụng ngân hàng để tự điền nội dung
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
                                        alt="Mã QR Chuyển Khoản"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                )}
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, p: 4 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                                Sao chép thông tin thủ công
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Nhấp vào nút sao chép bên cạnh để đảm bảo thông tin lệnh chuyển chính xác
                            </Typography>

                            {qrDetails && (
                                <Stack spacing={2.5}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                            Ngân hàng thụ hưởng
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                            {qrDetails.bank}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                            Tên đơn vị thụ hưởng
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                            TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" justifyContent="between" alignItems="center" sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Số tài khoản nhận
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                {qrDetails.acc}
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Sao chép số tài khoản">
                                            <IconButton size="small" onClick={() => handleCopy(qrDetails.acc)}>
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>

                                    <Stack direction="row" justifyContent="between" alignItems="center" sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Số tiền giao dịch
                                            </Typography>
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
                                                Nội dung chuyển khoản chuẩn
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main', letterSpacing: '0.5px' }}>
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
                        Đóng cửa sổ
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}