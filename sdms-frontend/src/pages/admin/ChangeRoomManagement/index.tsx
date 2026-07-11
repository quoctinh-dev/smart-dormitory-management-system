import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { changeRoomApi } from '@/api/changeRoomApi';
import { ChangeRoomResponseDto, ChangeRoomRequestStatus, AdminProcessChangeRoomDto, MaintenanceRelocationDto } from '@/types/changeRoom';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function ChangeRoomManagementPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [tabValue, setTabValue] = useState(0);

    // --- State for Change Room Requests ---
    const [requests, setRequests] = useState<ChangeRoomResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ChangeRoomResponseDto | null>(null);
    const [processDialogOpen, setProcessDialogOpen] = useState(false);
    const [processData, setProcessData] = useState<AdminProcessChangeRoomDto>({
        isApproved: false,
        adminNote: '',
        newBedId: '',
    });

    // --- State for Maintenance Relocation ---
    const [maintenanceData, setMaintenanceData] = useState<MaintenanceRelocationDto>({
        maintenanceRoomId: '',
        relocations: [],
    });
    const [relocating, setRelocating] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await changeRoomApi.getAllRequests();
            if (res && res.content) {
                setRequests(res.content);
            } else if (Array.isArray(res)) {
                setRequests(res as any);
            }
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Lỗi khi tải danh sách yêu cầu', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tabValue === 0) {
            fetchRequests();
        }
    }, [tabValue]);

    const handleProcessOpen = (request: ChangeRoomResponseDto, isApproved: boolean) => {
        setSelectedRequest(request);
        setProcessData({ isApproved, adminNote: '', newBedId: '' });
        setProcessDialogOpen(true);
    };

    const handleProcessSubmit = async () => {
        if (!selectedRequest) return;
        if (processData.isApproved && !processData.newBedId) {
            enqueueSnackbar('Vui lòng nhập ID giường mới để chuyển sinh viên đến', { variant: 'warning' });
            return;
        }

        try {
            await changeRoomApi.processRequest(selectedRequest.id, processData);
            enqueueSnackbar('Xử lý yêu cầu thành công', { variant: 'success' });
            setProcessDialogOpen(false);
            fetchRequests();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Xử lý thất bại', { variant: 'error' });
        }
    };

    const handleRelocationSubmit = async () => {
        if (!maintenanceData.maintenanceRoomId) {
            enqueueSnackbar('Vui lòng nhập ID phòng bảo trì', { variant: 'warning' });
            return;
        }

        try {
            setRelocating(true);
            await changeRoomApi.relocateForMaintenance(maintenanceData);
            enqueueSnackbar('Di dời thành công', { variant: 'success' });
            setMaintenanceData({ maintenanceRoomId: '', relocations: [] });
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Di dời thất bại', { variant: 'error' });
        } finally {
            setRelocating(false);
        }
    };

    const renderStatus = (status: ChangeRoomRequestStatus) => {
        switch (status) {
            case 'PENDING': return <Chip label="Đang chờ" color="warning" size="small" />;
            case 'APPROVED': return <Chip label="Đã duyệt" color="success" size="small" />;
            case 'REJECTED': return <Chip label="Từ chối" color="error" size="small" />;
            default: return <Chip label={status} size="small" />;
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" color="primary" mb={1}>
                Quản lý Đổi phòng & Di dời
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Duyệt đơn xin đổi phòng của sinh viên hoặc di dời sinh viên do bảo trì phòng.
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
                    <Tab label="Đơn xin đổi phòng" />
                    <Tab label="Di dời do bảo trì" />
                </Tabs>
            </Box>

            {/* Tab 1: Đơn xin đổi phòng */}
            <TabPanel value={tabValue} index={0}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <CardContent sx={{ p: 0 }}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                        ) : (
                            <TableContainer component={Paper} elevation={0}>
                                <Table>
                                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                                        <TableRow>
                                            <TableCell><b>Ngày gửi</b></TableCell>
                                            <TableCell><b>Phòng hiện tại</b></TableCell>
                                            <TableCell><b>Phòng mong muốn</b></TableCell>
                                            <TableCell><b>Lý do</b></TableCell>
                                            <TableCell><b>Trạng thái</b></TableCell>
                                            <TableCell align="right"><b>Thao tác</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {requests.length === 0 ? (
                                            <TableRow><TableCell colSpan={6} align="center">Chưa có dữ liệu</TableCell></TableRow>
                                        ) : (
                                            requests.map((req) => (
                                                <TableRow key={req.id}>
                                                    <TableCell>{new Date(req.createdAt).toLocaleString('vi-VN')}</TableCell>
                                                    <TableCell>{req.currentRoomName || 'N/A'}</TableCell>
                                                    <TableCell>{req.targetRoomName || 'Không xác định'}</TableCell>
                                                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {req.reason}
                                                    </TableCell>
                                                    <TableCell>{renderStatus(req.status)}</TableCell>
                                                    <TableCell align="right">
                                                        {req.status === 'PENDING' && (
                                                            <Box display="flex" gap={1} justifyContent="flex-end">
                                                                <Button size="small" variant="contained" color="success" onClick={() => handleProcessOpen(req, true)}>Duyệt</Button>
                                                                <Button size="small" variant="outlined" color="error" onClick={() => handleProcessOpen(req, false)}>Từ chối</Button>
                                                            </Box>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            </TabPanel>

            {/* Tab 2: Di dời do bảo trì */}
            <TabPanel value={tabValue} index={1}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <CardContent>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Tính năng này cho phép di dời hàng loạt sinh viên từ một phòng đang bảo trì sang các giường khác. Yêu cầu phòng cũ phải có trạng thái MAINTENANCE.
                        </Alert>
                        <Box display="flex" flexDirection="column" gap={3} maxWidth={600}>
                            <TextField
                                label="ID Phòng bảo trì (UUID)"
                                fullWidth
                                required
                                value={maintenanceData.maintenanceRoomId}
                                onChange={(e) => setMaintenanceData({ ...maintenanceData, maintenanceRoomId: e.target.value })}
                            />
                            
                            {/* Simple dynamic list representation. In a real scenario, this would be a complex grid or selection. */}
                            <Typography variant="subtitle1" fontWeight="bold">Danh sách sinh viên di dời (JSON)</Typography>
                            <TextField
                                label="Nhập mảng JSON [{ studentId: '...', targetBedId: '...' }]"
                                multiline
                                rows={4}
                                fullWidth
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        setMaintenanceData({ ...maintenanceData, relocations: parsed });
                                    } catch (err) {
                                        // Ignore parse error while typing
                                    }
                                }}
                                helperText="Dữ liệu mẫu: [{'studentId': 'uuid1', 'targetBedId': 'uuid2'}]"
                            />

                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleRelocationSubmit}
                                disabled={relocating}
                            >
                                {relocating ? 'Đang di dời...' : 'Thực hiện di dời'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </TabPanel>

            {/* Dialog xử lý đơn */}
            <Dialog open={processDialogOpen} onClose={() => setProcessDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{processData.isApproved ? 'Duyệt yêu cầu đổi phòng' : 'Từ chối yêu cầu đổi phòng'}</DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Ghi chú của Admin"
                            multiline
                            rows={3}
                            fullWidth
                            value={processData.adminNote}
                            onChange={(e) => setProcessData({ ...processData, adminNote: e.target.value })}
                        />
                        {processData.isApproved && (
                            <TextField
                                label="ID Giường mới (UUID)"
                                fullWidth
                                required
                                value={processData.newBedId}
                                onChange={(e) => setProcessData({ ...processData, newBedId: e.target.value })}
                                helperText="ID của giường mới sẽ cấp cho sinh viên."
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProcessDialogOpen(false)}>Hủy</Button>
                    <Button variant="contained" color={processData.isApproved ? 'success' : 'error'} onClick={handleProcessSubmit}>
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
