import { useState } from 'react';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, Snackbar, Alert, Box, CircularProgress, Chip, Tooltip
} from '@mui/material';
import { Edit, PlayCircleOutline, PauseCircleOutline, Group } from '@mui/icons-material';
import { useRegistrationPeriods } from '@/hooks/useRegistrationPeriods';
import CustomSkeleton from '@/components/CustomSkeleton';
import EligibilityManagerDialog from './EligibilityManagerDialog';

const REGISTRATION_TYPES = {
    CURRENT_RESIDENT: 'Sinh viên đang lưu trú',
    NEW_STUDENT: 'Tân sinh viên',
    OPEN_REGISTRATION: 'Mở tự do'
};

export default function RegistrationPeriodManager() {
    const { periods, loading, isSubmitting, error, handleCreate, handleUpdate, handleActivate, handleDeactivate } = useRegistrationPeriods();
    
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentPeriod, setCurrentPeriod] = useState(null);
    const [formData, setFormData] = useState({ periodName: '', registrationType: 'OPEN_REGISTRATION', startDate: '', endDate: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
    const [selectedPeriodForEligibility, setSelectedPeriodForEligibility] = useState(null);

    const formatDateTime = (dateStr) => new Date(dateStr).toISOString().slice(0, 16);

    const handleOpenCreate = () => {
        setEditMode(false);
        setFormData({ periodName: '', registrationType: 'OPEN_REGISTRATION', startDate: '', endDate: '' });
        setOpenDialog(true);
    };

    const handleOpenEdit = (period) => {
        setEditMode(true);
        setCurrentPeriod(period);
        setFormData({
            periodName: period.periodName,
            registrationType: period.registrationType,
            startDate: formatDateTime(period.startDate),
            endDate: formatDateTime(period.endDate)
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => { setOpenDialog(false); setCurrentPeriod(null); };
    const handleCloseEligibility = () => { setEligibilityDialogOpen(false); setSelectedPeriodForEligibility(null); };

    const handleSubmit = async () => {
        const result = editMode ? await handleUpdate(currentPeriod.periodId, formData) : await handleCreate(formData);
        if (result.success) {
            setSnackbar({ open: true, message: editMode ? 'Cập nhật thành công' : 'Tạo mới thành công', severity: 'success' });
            handleCloseDialog();
        } else {
            setSnackbar({ open: true, message: result.message, severity: 'error' });
        }
    };

    const onAction = async (actionFn, id, successMsg) => {
        const result = await actionFn(id);
        setSnackbar({ open: true, message: result.success ? successMsg : result.message, severity: result.success ? 'success' : 'error' });
    };

    if (loading && periods.length === 0) return <Container sx={{ py: 4 }}><CustomSkeleton type="table" /></Container>;

    return (
        <Container sx={{ py: 4 }} maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">Quản lý Đợt đăng ký</Typography>
                <Button variant="contained" onClick={handleOpenCreate}>+ Tạo đợt mới</Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell><strong>Tên đợt</strong></TableCell>
                            <TableCell><strong>Loại</strong></TableCell>
                            <TableCell><strong>Bắt đầu</strong></TableCell>
                            <TableCell><strong>Kết thúc</strong></TableCell>
                            <TableCell><strong>Trạng thái</strong></TableCell>
                            <TableCell align="center"><strong>Thao tác</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {periods.map((row) => (
                            <TableRow key={row.periodId} hover>
                                <TableCell>{row.periodName}</TableCell>
                                <TableCell>{REGISTRATION_TYPES[row.registrationType]}</TableCell>
                                <TableCell>{new Date(row.startDate).toLocaleString('vi-VN')}</TableCell>
                                <TableCell>{new Date(row.endDate).toLocaleString('vi-VN')}</TableCell>
                                <TableCell>
                                    <Chip label={row.isActive ? 'Đang hoạt động' : 'Tạm dừng'} color={row.isActive ? 'success' : 'default'} size="small" />
                                </TableCell>
                                <TableCell align="center">
                                    <Box display="flex" justifyContent="center" alignItems="center" gap={0.5}>
                                        {row.registrationType !== 'OPEN_REGISTRATION' && (
                                            <Tooltip title="Danh sách đủ điều kiện">
                                                <IconButton color="info" size="small" onClick={() => { setSelectedPeriodForEligibility(row); setEligibilityDialogOpen(true); }}>
                                                    <Group fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Chỉnh sửa">
                                            <IconButton size="small" onClick={() => handleOpenEdit(row)}><Edit fontSize="small" /></IconButton>
                                        </Tooltip>
                                        <Tooltip title={row.isActive ? "Tạm dừng" : "Kích hoạt"}>
                                            <IconButton color={row.isActive ? "warning" : "success"} size="small" onClick={() => onAction(row.isActive ? handleDeactivate : handleActivate, row.periodId, row.isActive ? 'Đã tắt đợt' : 'Kích hoạt thành công')}>
                                                {row.isActive ? <PauseCircleOutline fontSize="small" /> : <PlayCircleOutline fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Form ... (Giữ nguyên logic cũ) */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? 'Cập nhật đợt' : 'Tạo đợt mới'}</DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} pt={1}>
                        <TextField fullWidth label="Tên đợt" value={formData.periodName} onChange={(e) => setFormData({...formData, periodName: e.target.value})} required />
                        {!editMode && (
                            <TextField select fullWidth label="Loại" value={formData.registrationType} onChange={(e) => setFormData({...formData, registrationType: e.target.value})}>
                                {Object.entries(REGISTRATION_TYPES).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
                            </TextField>
                        )}
                        <TextField fullWidth type="datetime-local" label="Ngày bắt đầu" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} InputLabelProps={{ shrink: true }} required />
                        <TextField fullWidth type="datetime-local" label="Ngày kết thúc" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} InputLabelProps={{ shrink: true }} required />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>{isSubmitting ? <CircularProgress size={24} /> : 'Lưu lại'}</Button>
                </DialogActions>
            </Dialog>

            <EligibilityManagerDialog open={eligibilityDialogOpen} onClose={handleCloseEligibility} period={selectedPeriodForEligibility} />
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
}