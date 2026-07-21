import BadgeIcon from '@mui/icons-material/Badge';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import SchoolIcon from '@mui/icons-material/School';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Tooltip,
    Typography,
} from '@mui/material';
import {alpha, useTheme} from '@mui/material/styles';
import React from 'react';

// 1. Interface rõ ràng thay vì 'any'
export interface StudentProfile {
    studentCode: string;
    rfidCode?: string;
    faculty?: string;
    academicYear?: string;
    fullName: string;
    gender: 'MALE' | 'FEMALE' | string;
    dateOfBirth?: string;
    dob?: string;
    ethnicity?: string;
    nationalId?: string;
    cccd?: string;
    phone?: string;
    email?: string;
    permanentAddress?: string;
    fatherName?: string;
    fatherPhone?: string;
    motherName?: string;
    motherPhone?: string;
    contactAddress?: string;
}

interface StudentProfileModalProps {
    open: boolean;
    onClose: () => void;
    loading: boolean;
    profile: StudentProfile | null;
    onOpenEditAcademic?: () => void;
    hideEditButton?: boolean;
}

// 2. Component con tái sử dụng
interface InfoItemProps {
    label: string;
    children: React.ReactNode;
    xs?: number;
    sm?: number;
    md?: number;
}

const InfoItem: React.FC<InfoItemProps> = ({label, children, xs = 12, sm = 6, md = 4}) => (
    <Grid item xs={xs} sm={sm} md={md}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 0.5}}>
            {label}
        </Typography>
        {typeof children === 'string' || typeof children === 'number' ? (
            <Typography variant="body2" fontWeight="600" color="text.primary">
                {children || '—'}
            </Typography>
        ) : (
            children
        )}
    </Grid>
);

export default function StudentProfileModal({
                                                open,
                                                onClose,
                                                loading,
                                                profile,
                                                onOpenEditAcademic,
                                                hideEditButton = false,
                                            }: StudentProfileModalProps) {
    const theme = useTheme();

    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {borderRadius: 2, overflow: 'hidden'},
            }}
        >
            {/* ── Header Modal ───────────────────────── */}
            <DialogTitle
                sx={{
                    fontWeight: 700,
                    bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 2,
                    px: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{bgcolor: theme.palette.primary.main, width: 36, height: 36}}>
                        <BadgeIcon fontSize="small"/>
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="700" lineHeight={1.2}>
                            Hồ sơ Sinh viên
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Dữ liệu cá nhân chính thức lưu trữ tại KTX STU
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{color: 'text.secondary'}}>
                    <CloseIcon fontSize="small"/>
                </IconButton>
            </DialogTitle>

            {/* ── Content Modal ───────────────────────── */}
            <DialogContent sx={{p: 3, bgcolor: (theme) => alpha(theme.palette.background.default, 0.5)}}>
                {loading ? (
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2}}>
                        <CircularProgress size={32}/>
                        <Typography variant="body2" color="text.secondary">
                            Đang tải dữ liệu...
                        </Typography>
                    </Box>
                ) : profile ? (
                    <Grid container spacing={2.5}>
                        {/* Nhóm 1: Thông tin học vụ */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{p: 2.5, borderRadius: 2, bgcolor: 'background.paper'}}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 2,
                                        color: 'primary.main',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    <SchoolIcon fontSize="small"/> THÔNG TIN HỌC VỤ & HỆ THỐNG
                                </Typography>
                                <Grid container spacing={2}>
                                    <InfoItem label="Mã sinh viên" md={3}>
                                        <Typography variant="body2" fontWeight="700" color="primary.main" fontFamily="monospace">
                                            {profile.studentCode || '—'}
                                        </Typography>
                                    </InfoItem>

                                    <InfoItem label="Mã thẻ RFID tích hợp" md={3}>
                                        {profile.rfidCode ? (
                                            <Box
                                                component="span"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.85rem',
                                                    bgcolor: alpha(theme.palette.success.main, 0.08),
                                                    color: theme.palette.success.dark,
                                                    px: 1,
                                                    py: 0.3,
                                                    borderRadius: 1,
                                                    display: 'inline-block',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {profile.rfidCode}
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="text.disabled" sx={{fontStyle: 'italic'}}>
                                                Chưa được gán
                                            </Typography>
                                        )}
                                    </InfoItem>

                                    <InfoItem label="Khoa / Chuyên ngành" md={3}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" fontWeight="600">
                                                {profile.faculty || '—'}
                                            </Typography>
                                            {!hideEditButton && (
                                                <Tooltip title="Chỉnh sửa học vụ">
                                                    <IconButton
                                                        size="small"
                                                        onClick={onOpenEditAcademic}
                                                        sx={{
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                            p: 0.5,
                                                            borderRadius: 1.5,
                                                            bgcolor: 'background.paper',
                                                            '&:hover': {
                                                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                                                                borderColor: theme.palette.primary.light,
                                                                color: theme.palette.primary.main,
                                                            },
                                                        }}
                                                    >
                                                        <EditIcon sx={{fontSize: 13}}/>
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </InfoItem>

                                    <InfoItem label="Khóa học / Niên khóa" md={3}>
                                        {profile.academicYear}
                                    </InfoItem>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Nhóm 2: Thông tin cá nhân & liên hệ */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{p: 2.5, borderRadius: 2, bgcolor: 'background.paper'}}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 2,
                                        color: 'primary.main',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    <FingerprintIcon fontSize="small"/> DANH TÍNH CÁ NHÂN & LIÊN HỆ
                                </Typography>
                                <Grid container spacing={2}>
                                    <InfoItem label="Họ và tên">{profile.fullName}</InfoItem>
                                    <InfoItem label="Giới tính">
                                        {profile.gender === 'MALE' ? 'Nam' : profile.gender === 'FEMALE' ? 'Nữ' : '—'}
                                    </InfoItem>
                                    <InfoItem label="Ngày sinh">{profile.dateOfBirth || profile.dob}</InfoItem>
                                    <InfoItem label="Dân tộc">{profile.ethnicity}</InfoItem>
                                    <InfoItem label="Số CCCD / Hộ chiếu">{profile.nationalId || profile.cccd}</InfoItem>
                                    <InfoItem label="Số điện thoại liên hệ">{profile.phone}</InfoItem>

                                    <InfoItem label="Địa chỉ Email học tập">
                                        <Typography variant="body2" fontWeight="600" color="primary.main">
                                            {profile.email || '—'}
                                        </Typography>
                                    </InfoItem>

                                    <InfoItem label="Địa chỉ thường trú" sm={8} md={8}>
                                        <Typography variant="body2" fontWeight="600">
                                            {profile.permanentAddress || '—'}
                                        </Typography>
                                    </InfoItem>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Nhóm 3: Thông tin gia đình */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{p: 2.5, borderRadius: 2, bgcolor: 'background.paper'}}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 2,
                                        color: 'primary.main',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    <FamilyRestroomIcon fontSize="small"/> QUAN HỆ GIA ĐÌNH & KHẨN CẤP
                                </Typography>

                                <Grid container spacing={2}>
                                    <InfoItem label="Họ tên Cha" sm={6} md={6}>
                                        {profile.fatherName}
                                    </InfoItem>
                                    <InfoItem label="Số điện thoại Cha" sm={6} md={6}>
                                        {profile.fatherPhone}
                                    </InfoItem>

                                    <InfoItem label="Họ tên Mẹ" sm={6} md={6}>
                                        {profile.motherName}
                                    </InfoItem>
                                    <InfoItem label="Số điện thoại Mẹ" sm={6} md={6}>
                                        {profile.motherPhone}
                                    </InfoItem>

                                    <InfoItem label="Địa chỉ liên hệ của gia đình (báo tin khi cần)" sm={12} md={12}>
                                        <Typography variant="body2" fontWeight="600" color="error.main">
                                            {profile.contactAddress || '—'}
                                        </Typography>
                                    </InfoItem>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                ) : (
                    <Typography color="error" align="center" sx={{py: 4}}>
                        Không có dữ liệu hợp lệ.
                    </Typography>
                )}
            </DialogContent>

            {/* ── Actions Modal ───────────────────────── */}
            <DialogActions sx={{px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider'}}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    disableElevation
                    sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                    }}
                >
                    Đóng hồ sơ
                </Button>
            </DialogActions>
        </Dialog>
    );
}