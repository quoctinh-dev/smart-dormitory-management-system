import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Switch, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { alpha } from '@mui/material/styles';
import { smartAccessApi } from '@/api/smart-access-api';
import { CurfewPolicy, TimeWindowPolicy } from '@/types/smart-access';
import { snackbar } from '@/helpers/snackbar';
import roomApi from '@/api/room-api';

const INITIAL_FORM_STATE = {
    buildingId: '',
    type: 'STANDARD',
    residentType: 'BOARDING',
    startTime: '23:00:00',
    endTime: '05:00:00',
    priority: 1,
    isActive: true
};

const POLICY_TYPES: Record<string, { label: string, color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
    'STANDARD': { label: 'Bình thường', color: 'success' },
    'SPECIAL_EVENT': { label: 'Sự kiện đặc biệt', color: 'warning' },
    'HARD_LOCKDOWN': { label: 'Khóa chặt', color: 'error' }
};

export default function SmartAccessPolicyPage() {
    const [curfews, setCurfews] = useState<CurfewPolicy[]>([]);
    const [timeWindows, setTimeWindows] = useState<TimeWindowPolicy[]>([]);
    const [buildings, setBuildings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    useEffect(() => {
        fetchPolicies();
        fetchBuildings();
    }, []);

    const fetchBuildings = async () => {
        try {
            const res = await roomApi.getBuildings();
            setBuildings((res as any) || []);
        } catch (e) {
            console.error("Lỗi tải danh sách tòa nhà:", e);
        }
    };

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const [cRes, tRes] = await Promise.all([
                smartAccessApi.getCurfewPolicies(),
                smartAccessApi.getTimeWindowPolicies()
            ]);
            setCurfews((cRes as any) || []);
            setTimeWindows((tRes as any) || []);
        } catch (error) {
            snackbar.error("Rất tiếc, không thể tải danh sách quy định lúc này.");
        } finally {
            setLoading(false);
        }
    };

    const toggleCurfew = async (id: string, currentStatus: boolean) => {
        try {
            await smartAccessApi.updateCurfewPolicyStatus(id, !currentStatus);
            snackbar.success("Đã cập nhật trạng thái quy định!");
            fetchPolicies();
        } catch {
            snackbar.error("Chưa thể cập nhật trạng thái, vui lòng thử lại.");
        }
    };

    const deleteCurfew = async (id: string) => {
        if(!window.confirm("Bạn có chắc chắn muốn gỡ bỏ quy định giới nghiêm này không?")) return;
        try {
            await smartAccessApi.deleteCurfewPolicy(id);
            snackbar.success("Đã gỡ bỏ quy định thành công.");
            fetchPolicies();
        } catch {
            snackbar.error("Chưa thể gỡ bỏ quy định, vui lòng thử lại sau.");
        }
    };

    const handleCreate = async () => {
        if (!formData.buildingId) {
            snackbar.error("Bạn quên chọn tòa nhà áp dụng rồi!");
            return;
        }
        try {
            await smartAccessApi.createCurfewPolicy(formData);
            snackbar.success("Đã thiết lập quy định mới thành công!");
            handleCloseDialog();
            fetchPolicies();
        } catch (error) {
            snackbar.error("Rất tiếc, đã có lỗi xảy ra khi lưu quy định mới.");
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormData(INITIAL_FORM_STATE);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                        Cài đặt quy định ra vào
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Quản lý giờ giới nghiêm và khung giờ hoạt động cho cư dân tại các tòa nhà.
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Danh sách giờ giới nghiêm</Typography>
                <Button
                    variant="contained"
                    disableElevation
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                    Thêm quy định mới
                </Button>
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Loại quy định</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Bắt đầu</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Kết thúc</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Mức độ ưu tiên</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Hoạt động</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary" variant="body2">Đang tải dữ liệu...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : curfews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary" variant="body2">Hiện tại chưa có quy định giới nghiêm nào được thiết lập.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : curfews.map(c => {
                                const policyConfig = POLICY_TYPES[c.type] || { label: c.type, color: 'default' };

                                return (
                                    <TableRow key={c.id} hover>
                                        <TableCell>
                                            <Chip
                                                label={policyConfig.label}
                                                size="small"
                                                color={policyConfig.color as any}
                                                variant={c.type === 'HARD_LOCKDOWN' ? 'filled' : 'outlined'}
                                                sx={{ fontWeight: 600, borderRadius: 1 }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.startTime}</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.endTime}</TableCell>
                                        <TableCell align="center">{c.priority}</TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={c.isActive}
                                                onChange={() => toggleCurfew(c.id, c.isActive)}
                                                color="success"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton color="error" size="small" onClick={() => deleteCurfew(c.id)} title="Gỡ bỏ quy định này">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>Thiết lập giờ giới nghiêm mới</DialogTitle>
                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                    <FormControl fullWidth size="small">
                        <InputLabel>Tòa nhà áp dụng</InputLabel>
                        <Select
                            label="Tòa nhà áp dụng"
                            value={formData.buildingId}
                            onChange={(e) => setFormData({...formData, buildingId: e.target.value})}
                        >
                            {buildings.map((b: any) => (
                                <MenuItem key={b.buildingId} value={b.buildingId}>{b.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel>Loại quy định</InputLabel>
                        <Select
                            label="Loại quy định"
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <MenuItem value="STANDARD">Bình thường</MenuItem>
                            <MenuItem value="SPECIAL_EVENT">Sự kiện đặc biệt</MenuItem>
                            <MenuItem value="HARD_LOCKDOWN">Khóa chặt</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Giờ bắt đầu"
                            type="time"
                            fullWidth
                            size="small"
                            value={formData.startTime.substring(0, 5)}
                            onChange={(e) => setFormData({...formData, startTime: e.target.value + ':00'})}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                        />
                        <TextField
                            label="Giờ kết thúc"
                            type="time"
                            fullWidth
                            size="small"
                            value={formData.endTime.substring(0, 5)}
                            onChange={(e) => setFormData({...formData, endTime: e.target.value + ':00'})}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                        />
                    </Box>

                    <TextField
                        label="Mức độ ưu tiên"
                        type="number"
                        fullWidth
                        size="small"
                        helperText="Số càng lớn, quy định này càng được ưu tiên áp dụng (ghi đè các quy định chung của hệ thống)."
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 1})}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit" sx={{ fontWeight: 600 }}>Hủy bỏ</Button>
                    <Button onClick={handleCreate} variant="contained" disableElevation sx={{ fontWeight: 600 }}>
                        Lưu quy định
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}