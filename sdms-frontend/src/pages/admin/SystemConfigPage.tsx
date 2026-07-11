import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
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
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { systemConfigApi, SystemConfig } from '@/api/systemConfigApi';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';

export default function SystemConfigPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await systemConfigApi.getAllConfigs();
      setConfigs(res);
      
      const values: Record<string, string> = {};
      res.forEach((config: SystemConfig) => {
        values[config.configKey] = config.configValue;
      });
      setEditValues(values);
    } catch (error) {
      enqueueSnackbar('Lỗi khi tải cấu hình hệ thống', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async (config: SystemConfig) => {
    const newValue = editValues[config.configKey];
    
    if (!newValue || newValue.trim() === '') {
      enqueueSnackbar('Giá trị không được để trống', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      await systemConfigApi.updateConfig(config.configKey, { configValue: newValue });
      enqueueSnackbar('Cập nhật cấu hình thành công!', { variant: 'success' });
      fetchConfigs();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Lỗi khi cập nhật cấu hình', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SettingsIcon color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Cấu Hình Hệ Thống
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cài đặt các thông số toàn cục như Đơn giá, Cấu hình nghiệp vụ.
          </Typography>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="system config table">
          <TableHead sx={{ bgcolor: '#fafafa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Mã Cấu Hình (Key)</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Mô Tả</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Giá Trị Hiện Tại</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Chưa có cấu hình nào</Typography>
                </TableCell>
              </TableRow>
            ) : (
              configs.map((config) => {
                const currentValue = editValues[config.configKey] ?? '';
                const isChanged = currentValue !== config.configValue;

                return (
                  <TableRow key={config.configKey} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.dark' }}>
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
                        value={currentValue}
                        onChange={(e) => handleValueChange(config.configKey, e.target.value)}
                        placeholder="Nhập giá trị..."
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<SaveIcon />}
                        disabled={!isChanged || loading}
                        onClick={() => handleSave(config)}
                      >
                        Lưu
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
