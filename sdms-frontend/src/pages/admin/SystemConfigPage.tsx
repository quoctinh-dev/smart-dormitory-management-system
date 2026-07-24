import SaveIcon from '@mui/icons-material/Save';
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
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useState, useMemo, useEffect } from 'react';

import { useSystemConfig } from '@/hooks/useSystemConfig';

// Tự động nhận diện đơn vị dựa trên mã cấu hình
const getUnitSuffix = (key: string) => {
    const upperKey = key.toUpperCase();

    if (
        upperKey.includes('_START') ||
        upperKey.includes('_END') ||
        upperKey.includes('CURFEW') ||
        upperKey.includes('DUAL_AUTH') ||
        (upperKey.includes('DEADLINE') && !upperKey.includes('DAYS')) ||
        upperKey.includes('LATE_RETURN')
    ) {
        return 'HH:mm';
    }
    if (
        upperKey.includes('PRICE') ||
        upperKey.includes('FEE') ||
        upperKey.includes('AMOUNT') ||
        upperKey.includes('MONEY')
    ) {
        return 'VNĐ';
    }
    if (upperKey.includes('DAY') || upperKey.includes('DEADLINE')) {
        return 'Ngày';
    }
    if (upperKey.includes('MONTH')) {
        return 'Tháng';
    }
    if (upperKey.includes('PERCENT')) {
        return '%';
    }
    return '';
};

// Định dạng giá trị hiển thị có dấu phân cách hàng nghìn (VD: 15000 -> 15,000)
const formatDisplayValue = (val: string, unit: string) => {
    if (!val) return '';
    if (unit === 'VNĐ') {
        const num = Number(val);
        if (!isNaN(num)) {
            return new Intl.NumberFormat('en-US').format(num);
        }
    }
    return val;
};

export default function SystemConfigPage() {
    const { configs, editValues, loading, handleValueChange, handleSave } = useSystemConfig();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [activeGroup, setActiveGroup] = useState<string>('GENERAL');

    // Lấy danh sách các nhóm duy nhất từ dữ liệu API
    const groups = useMemo(() => {
        const groupSet = new Set<string>();
        configs.forEach((c) => groupSet.add(c.groupName || 'GENERAL'));
        const arr = Array.from(groupSet);
        if (!arr.includes('GENERAL')) arr.unshift('GENERAL'); // Đảm bảo luôn có GENERAL
        return arr;
    }, [configs]);

    // Khi load data xong, nếu activeGroup không tồn tại thì set về tab đầu tiên
    useEffect(() => {
        if (groups.length > 0 && !groups.includes(activeGroup)) {
            setActiveGroup(groups[0]);
        }
    }, [groups, activeGroup]);

    const filteredConfigs = useMemo(() => {
        return configs.filter((c) => (c.groupName || 'GENERAL') === activeGroup);
    }, [configs, activeGroup]);

    const paginatedConfigs = filteredConfigs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header trang */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                    Cấu hình hệ thống
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Thiết lập các tham số toàn cục như đơn giá dịch vụ và thời gian quy định.
                </Typography>
            </Box>

            {/* Tabs Lọc theo Nhóm */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={activeGroup}
                    onChange={(_, newValue) => {
                        setActiveGroup(newValue);
                        setPage(0); // Reset trang khi đổi tab
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="primary"
                    indicatorColor="primary"
                >
                    {groups.map((grp) => (
                        <Tab 
                            key={grp} 
                            label={grp === 'GENERAL' ? 'Cấu hình chung' : 
                                   grp === 'SMART_ACCESS' ? 'Kiểm soát ra vào' : 
                                   grp === 'PAYMENT' ? 'Tài chính - Dịch vụ' : grp} 
                            value={grp} 
                            sx={{ fontWeight: 600 }}
                        />
                    ))}
                </Tabs>
            </Box>

            {/* Bảng thông số cấu hình */}
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="Bảng cấu hình hệ thống">
                        <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                            <TableRow>
                                <TableCell width="30%" sx={{ fontWeight: 600 }}>Tham số (Mã cấu hình)</TableCell>
                                <TableCell width="35%" sx={{ fontWeight: 600 }}>Mô tả chức năng</TableCell>
                                <TableCell width="22%" sx={{ fontWeight: 600 }}>Giá trị thiết lập</TableCell>
                                <TableCell width="13%" align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && configs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : configs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary" variant="body2">
                                            Chưa có tham số cấu hình nào trong hệ thống.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedConfigs.map((config) => {
                                    const currentValue = editValues[config.configKey] ?? '';
                                    const isChanged = currentValue !== config.configValue;
                                    const unit = getUnitSuffix(config.configKey);
                                    const isTimeType = unit === 'HH:mm';

                                    return (
                                        <TableRow hover key={config.configKey}>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}
                                                >
                                                    {config.configKey}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {config.description}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    value={unit === 'VNĐ' ? formatDisplayValue(currentValue, unit) : currentValue}
                                                    onChange={(e) => {
                                                        let val = e.target.value;
                                                        if (unit === 'VNĐ') {
                                                            val = val.replace(/,/g, '');
                                                        }
                                                        if (unit === 'VNĐ' && val !== '' && !/^\d+$/.test(val)) {
                                                            return;
                                                        }
                                                        if (isTimeType && val !== '' && !/^([01]?\d|2[0-3])?(:[0-5]?\d?)?$/.test(val)) {
                                                            return;
                                                        }
                                                        handleValueChange(config.configKey, val);
                                                    }}
                                                    placeholder={isTimeType ? 'HH:mm (VD: 22:00)' : 'Nhập giá trị...'}
                                                    InputProps={{
                                                        endAdornment: unit ? (
                                                            <InputAdornment position="end">
                                                                <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.disabled' }}>
                                                                    {unit}
                                                                </Typography>
                                                            </InputAdornment>
                                                        ) : null,
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell align="center">
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<SaveIcon />}
                                                    disabled={!isChanged || loading}
                                                    onClick={() => handleSave(config)}
                                                    disableElevation
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Lưu lại
                                                </Button>
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
                />
            </Paper>
        </Box>
    );
}