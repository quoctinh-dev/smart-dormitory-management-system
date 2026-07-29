import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
    Box,
    Typography,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    TablePagination,
    InputAdornment,
    Tabs,
    Tab,
    Chip,
    Stack,
    Tooltip,
    Collapse,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useState, useMemo, useEffect } from 'react';

import { useSystemConfig } from '@/hooks/useSystemConfig';

// Tên hiển thị nhóm cấu hình
const GROUP_LABEL_MAP: Record<string, string> = {
    GENERAL: 'Chung',
    SMART_ACCESS: 'Kiểm soát ra vào',
    PAYMENT: 'Tài chính & Chi phí',
    NOTIFICATIONS: 'Thông báo',
    SYSTEM: 'Hệ thống',
};

// Nhận diện kiểu dữ liệu & đơn vị tính
const getConfigMetadata = (key: string) => {
    const upperKey = key.toUpperCase();

    if (
        upperKey.includes('_START') ||
        upperKey.includes('_END') ||
        upperKey.includes('CURFEW') ||
        upperKey.includes('DUAL_AUTH') ||
        (upperKey.includes('DEADLINE') && !upperKey.includes('DAYS')) ||
        upperKey.includes('LATE_RETURN')
    ) {
        return { unit: 'HH:mm', type: 'time' };
    }
    if (
        upperKey.includes('PRICE') ||
        upperKey.includes('FEE') ||
        upperKey.includes('AMOUNT') ||
        upperKey.includes('MONEY')
    ) {
        return { unit: 'VNĐ', type: 'currency' };
    }
    if (upperKey.includes('DAY') || upperKey.includes('DEADLINE')) {
        return { unit: 'ngày', type: 'number' };
    }
    if (upperKey.includes('MONTH')) {
        return { unit: 'tháng', type: 'number' };
    }
    if (upperKey.includes('PERCENT')) {
        return { unit: '%', type: 'number' };
    }
    return { unit: '', type: 'text' };
};

// Định dạng hiển thị phân cách hàng nghìn
const formatDisplayValue = (val: string, type: string) => {
    if (!val) return '';
    if (type === 'currency') {
        const num = Number(val);
        if (!isNaN(num)) {
            return new Intl.NumberFormat('vi-VN').format(num);
        }
    }
    return val;
};

export default function SystemConfigPage() {
    const { configs, editValues, loading, handleValueChange, handleSave } = useSystemConfig();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [activeGroup, setActiveGroup] = useState<string>('GENERAL');
    const [savingAll, setSavingAll] = useState(false);

    // Lấy danh sách nhóm tham số
    const groups = useMemo(() => {
        const groupSet = new Set<string>();
        configs.forEach((c) => groupSet.add(c.groupName || 'GENERAL'));
        const arr = Array.from(groupSet);
        if (!arr.includes('GENERAL')) arr.unshift('GENERAL');
        return arr;
    }, [configs]);

    useEffect(() => {
        if (groups.length > 0 && !groups.includes(activeGroup)) {
            setActiveGroup(groups[0]);
        }
    }, [groups, activeGroup]);

    const filteredConfigs = useMemo(() => {
        return configs.filter((c) => (c.groupName || 'GENERAL') === activeGroup);
    }, [configs, activeGroup]);

    // Tổng số lượng tham số bị thay đổi chưa lưu
    const changedConfigs = useMemo(() => {
        return configs.filter((c) => {
            const currentVal = editValues[c.configKey];
            return currentVal !== undefined && currentVal !== c.configValue;
        });
    }, [configs, editValues]);

    const paginatedConfigs = filteredConfigs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Lưu toàn bộ thay đổi
    const handleSaveAllChanged = async () => {
        setSavingAll(true);
        try {
            for (const config of changedConfigs) {
                await handleSave(config);
            }
        } finally {
            setSavingAll(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, pb: changedConfigs.length > 0 ? 10 : 3 }}>
            {/* Header trang */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        Cấu hình hệ thống
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Quản lý tham số vận hành toàn cục, khung giờ truy cập và biểu phí dịch vụ.
                    </Typography>
                </Box>

                {/* Badge đếm thay đổi */}
                {changedConfigs.length > 0 && (
                    <Chip
                        icon={<InfoOutlinedIcon fontSize="small" />}
                        label={`Có ${changedConfigs.length} thay đổi chưa lưu`}
                        color="warning"
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                )}
            </Box>

            {/* Tabs chọn nhóm */}
            <Paper variant="outlined" sx={{ borderRadius: 2, mb: 3, bgcolor: 'background.paper' }}>
                <Tabs
                    value={activeGroup}
                    onChange={(_, newValue) => {
                        setActiveGroup(newValue);
                        setPage(0);
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        px: 1,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.92rem',
                            minHeight: 48,
                        },
                    }}
                >
                    {groups.map((grp) => (
                        <Tab
                            key={grp}
                            label={GROUP_LABEL_MAP[grp] || grp}
                            value={grp}
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Bảng cấu hình */}
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                            <TableRow>
                                <TableCell width="28%" sx={{ fontWeight: 700 }}>Mã tham số</TableCell>
                                <TableCell width="34%" sx={{ fontWeight: 700 }}>Mô tả</TableCell>
                                <TableCell width="26%" sx={{ fontWeight: 700 }}>Giá trị</TableCell>
                                <TableCell width="12%" align="center" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && configs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredConfigs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary" variant="body2" sx={{ fontStyle: 'italic' }}>
                                            Không tìm thấy tham số nào thuộc nhóm này.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedConfigs.map((config) => {
                                    const currentValue = editValues[config.configKey] ?? config.configValue ?? '';
                                    const isChanged = currentValue !== config.configValue;
                                    const { unit, type } = getConfigMetadata(config.configKey);

                                    return (
                                        <TableRow
                                            hover
                                            key={config.configKey}
                                            sx={{
                                                bgcolor: isChanged ? (theme) => alpha(theme.palette.warning.main, 0.04) : 'inherit',
                                                transition: 'background-color 0.2s',
                                            }}
                                        >
                                            <TableCell>
                                                <Stack spacing={0.5}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}
                                                    >
                                                        {config.configKey}
                                                    </Typography>
                                                    {isChanged && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Ban đầu: <strong>{formatDisplayValue(config.configValue, type)} {unit}</strong>
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                                                    {config.description}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    type={type === 'time' ? 'time' : 'text'}
                                                    value={type === 'currency' ? formatDisplayValue(currentValue, type) : currentValue}
                                                    onChange={(e) => {
                                                        let val = e.target.value;
                                                        if (type === 'currency') {
                                                            val = val.replace(/\D/g, ''); // Loại bỏ ký tự không phải số
                                                        }
                                                        handleValueChange(config.configKey, val);
                                                    }}
                                                    placeholder={type === 'time' ? '' : 'Nhập giá trị...'}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 1.5,
                                                            bgcolor: isChanged ? 'background.paper' : 'transparent',
                                                            borderColor: isChanged ? 'warning.main' : 'divider',
                                                            fontWeight: isChanged ? 700 : 400,
                                                        }
                                                    }}
                                                    InputProps={{
                                                        endAdornment: unit && type !== 'time' ? (
                                                            <InputAdornment position="end">
                                                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                                                    {unit}
                                                                </Typography>
                                                            </InputAdornment>
                                                        ) : null,
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell align="center">
                                                {isChanged ? (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        color="warning"
                                                        disableElevation
                                                        startIcon={<SaveIcon fontSize="small" />}
                                                        disabled={loading || savingAll}
                                                        onClick={() => handleSave(config)}
                                                        sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                                                    >
                                                        Lưu
                                                    </Button>
                                                ) : (
                                                    <Tooltip title="Giá trị chưa thay đổi">
                                                        <Chip
                                                            icon={<CheckCircleIcon fontSize="small" />}
                                                            label="Đã lưu"
                                                            size="small"
                                                            variant="outlined"
                                                            color="default"
                                                            sx={{ borderRadius: 1, fontWeight: 500, opacity: 0.7 }}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredConfigs.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="Số dòng mỗi trang:"
                    sx={{ borderTop: '1px solid', borderColor: 'divider' }}
                />
            </Paper>

            {/* Thanh tác vụ nổi phía dưới khi có thay đổi */}
            <Collapse in={changedConfigs.length > 0}>
                <Paper
                    elevation={6}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1200,
                        px: 3,
                        py: 1.5,
                        borderRadius: 3,
                        bgcolor: 'grey.900',
                        color: 'common.white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Có <strong>{changedConfigs.length}</strong> tham số chưa lưu thay đổi.
                    </Typography>
                    <Stack direction="row" spacing={1.5}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={savingAll ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                            disabled={savingAll}
                            onClick={handleSaveAllChanged}
                            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700, px: 2.5 }}
                        >
                            {savingAll ? 'Đang lưu...' : 'Lưu tất cả'}
                        </Button>
                    </Stack>
                </Paper>
            </Collapse>
        </Box>
    );
}