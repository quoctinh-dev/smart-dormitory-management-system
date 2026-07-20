import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
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
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';

import { useSystemConfig } from '@/hooks/useSystemConfig';

// Hàm tự động nhận diện đơn vị dựa trên key
const getUnitSuffix = (key: string) => {
  const upperKey = key.toUpperCase();
  if (upperKey.includes('PRICE') || upperKey.includes('FEE') || upperKey.includes('AMOUNT') || upperKey.includes('MONEY')) {
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

// Hàm format hiển thị dấu phẩy (vd: 15000 -> 15,000)
const formatDisplayValue = (val: string, unit: string) => {
  if (!val) return '';
  if (unit === 'VNĐ') {
    // Chỉ format nếu là số nguyên hợp lệ
    const num = Number(val);
    if (!isNaN(num)) {
      return new Intl.NumberFormat('en-US').format(num);
    }
  }
  return val;
};

export default function SystemConfigPage() {
  const { configs, editValues, loading, handleValueChange, handleSave } = useSystemConfig();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const paginatedConfigs = configs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            display: 'flex',
          }}
        >
          <SettingsIcon sx={{ fontSize: 32 }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Cấu hình hệ thống
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cài đặt các thông số toàn cục như Đơn giá, Cấu hình nghiệp vụ.
          </Typography>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        elevation={3}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="system config table">
          <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Mã cấu hình (key)</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Giá trị hiện tại</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">Chưa có cấu hình nào</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedConfigs.map((config) => {
                const currentValue = editValues[config.configKey] ?? '';
                const isChanged = currentValue !== config.configValue;
                const unit = getUnitSuffix(config.configKey);
                const isNumericType = unit === 'VNĐ' || unit === 'Ngày' || unit === '%' || unit === 'Tháng';

                return (
                  <TableRow
                    hover
                    key={config.configKey}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.dark' }}
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
                            // Xóa dấu phẩy để lưu giá trị raw
                            val = val.replace(/,/g, '');
                          }
                          // Chỉ cho phép nhập số nếu là VNĐ
                          if (unit === 'VNĐ' && val !== '' && !/^\d+$/.test(val)) {
                             return;
                          }
                          handleValueChange(config.configKey, val);
                        }}
                        placeholder="Nhập giá trị..."
                        InputProps={{
                          endAdornment: unit ? (
                            <InputAdornment position="end">
                              <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                {unit}
                              </Typography>
                            </InputAdornment>
                          ) : null,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(0,118,255,0.1)',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<SaveIcon />}
                        disabled={!isChanged || loading}
                        onClick={() => handleSave(config)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 'bold',
                          ...(isChanged && {
                            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                          }),
                        }}
                      >
                        Lưu thay đổi
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={configs.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số dòng/trang:"
        />
      </TableContainer>
    </Box>
  );
}
