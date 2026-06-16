import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, CircularProgress, Alert
} from '@mui/material';
import { Delete, CloudUpload } from '@mui/icons-material';
import periodApi from '@/api/periodApi';

export default function EligibilityManagerDialog({ open, onClose, period }) {
    const [eligibilities, setEligibilities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (open && period) {
            fetchEligibilities();
            setError(null);
            setSuccessMsg('');
        }
    }, [open, period]);

    const fetchEligibilities = async () => {
        setLoading(true);
        setError(null);
        try {
            // axiosClient đã unwrap dữ liệu, res ở đây là danh sách eligibilities trực tiếp
            const data = await periodApi.getEligibilities(period.periodId);
            setEligibilities(data || []);
        } catch (err) {
            setError('Lỗi khi tải danh sách: ' + (err?.message || 'Không thể kết nối tới server'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eligibilityId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này khỏi danh sách?')) return;
        try {
            await periodApi.deleteEligibility(period.periodId, eligibilityId);
            setSuccessMsg('Đã xóa thành công');
            setEligibilities(prev => prev.filter(e => e.eligibilityId !== eligibilityId));
        } catch (err) {
            setError('Lỗi khi xóa: ' + (err?.message || 'Có lỗi xảy ra'));
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImporting(true);
        setError(null);
        setSuccessMsg('');

        try {
            // Gọi API import
            const result = await periodApi.importEligibility(period.periodId, file);
            
            // Vì axios đã unwrap, result chính là object { totalRows, importedRows, skippedRows }
            setSuccessMsg(`Import thành công! Đã thêm: ${result.importedRows}, Bỏ qua: ${result.skippedRows} (Tổng: ${result.totalRows})`);
            
            // Làm mới danh sách hiển thị
            fetchEligibilities();
        } catch (err) {
            setError('Lỗi import: ' + (err?.message || 'Có lỗi xảy ra'));
        } finally {
            setImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (!period) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Danh sách đủ điều kiện - {period.periodName}
            </DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                        Tải lên file Excel (.xlsx) gồm cột CCCD và Họ Tên.
                    </Typography>
                    
                    <Box>
                        <input
                            type="file"
                            accept=".xlsx"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <Button 
                            variant="outlined" 
                            startIcon={importing ? <CircularProgress size={20} /> : <CloudUpload />} 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                        >
                            {importing ? 'Đang tải lên...' : 'Tải lên danh sách'}
                        </Button>
                    </Box>
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead sx={{ bgcolor: 'background.default' }}>
                                <TableRow>
                                    <TableCell><strong>STT</strong></TableCell>
                                    <TableCell><strong>CCCD</strong></TableCell>
                                    <TableCell><strong>Họ và tên</strong></TableCell>
                                    <TableCell align="center"><strong>Xóa</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {eligibilities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                            Chưa có dữ liệu. Vui lòng tải lên danh sách.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    eligibilities.map((row, index) => (
                                        <TableRow key={row.eligibilityId} hover>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.cccd}</TableCell>
                                            <TableCell>{row.fullName}</TableCell>
                                            <TableCell align="center">
                                                <IconButton 
                                                    color="error" 
                                                    size="small"
                                                    onClick={() => handleDelete(row.eligibilityId)}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Đóng</Button>
            </DialogActions>
        </Dialog>
    );
}