import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import gateApi, { GateResponse, GateRequest } from '@/api/gateApi';
import roomApi from '@/api/roomApi';
import CustomSkeleton from '@/components/common/CustomSkeleton';

export default function GateManagement() {
  const [gates, setGates] = useState<GateResponse[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<GateResponse | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState<GateRequest>({
    name: '',
    gateType: 'BUILDING_GATE',
    buildingId: '',
    roomId: '',
    macAddress: '',
    active: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gatesRes, buildingsRes] = await Promise.all([
        gateApi.getAllGates(),
        roomApi.getBuildings()
      ]);
      setGates(Array.isArray(gatesRes) ? gatesRes : (gatesRes as any)?.data || []);
      setBuildings(Array.isArray(buildingsRes) ? buildingsRes : (buildingsRes as any)?.data || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
      showSnackbar('Lỗi khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (gate?: GateResponse) => {
    if (gate) {
      setEditingGate(gate);
      setFormData({
        name: gate.name,
        gateType: gate.gateType,
        buildingId: gate.buildingId || '',
        roomId: gate.roomId || '',
        macAddress: gate.macAddress || '',
        active: gate.active,
      });
    } else {
      setEditingGate(null);
      setFormData({
        name: '',
        gateType: 'BUILDING_GATE',
        buildingId: '',
        roomId: '',
        macAddress: '',
        active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingGate) {
        await gateApi.updateGate(editingGate.gateId, formData);
        showSnackbar('Cập nhật cổng thành công', 'success');
      } else {
        await gateApi.createGate(formData);
        showSnackbar('Thêm mới cổng thành công', 'success');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra';
      showSnackbar(msg, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cổng này?')) {
      try {
        await gateApi.deleteGate(id);
        showSnackbar('Xóa cổng thành công', 'success');
        fetchData();
      } catch (error) {
        showSnackbar('Lỗi khi xóa cổng', 'error');
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Quản lý Cổng (IoT Gates)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Thêm Cổng Mới
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box p={3}><CustomSkeleton type="table" count={5} /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell><strong>Gate ID (UUID)</strong></TableCell>
                  <TableCell><strong>Tên Cổng</strong></TableCell>
                  <TableCell><strong>Loại Cổng</strong></TableCell>
                  <TableCell><strong>Tòa Nhà / Phòng</strong></TableCell>
                  <TableCell><strong>MAC Address</strong></TableCell>
                  <TableCell><strong>Trạng Thái</strong></TableCell>
                  <TableCell align="center"><strong>Hành động</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gates.map((gate) => (
                  <TableRow key={gate.gateId}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{gate.gateId}</TableCell>
                    <TableCell>{gate.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={gate.gateType} 
                        color={gate.gateType === 'BUILDING_GATE' ? 'primary' : 'secondary'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {gate.gateType === 'BUILDING_GATE' ? gate.buildingName : gate.roomCode}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{gate.macAddress || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={gate.active ? 'ACTIVE' : 'INACTIVE'} 
                        color={gate.active ? 'success' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleOpenDialog(gate)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(gate.gateId)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGate ? 'Cập nhật Cổng' : 'Thêm Cổng Mới'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Tên Cổng"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Loại Cổng</InputLabel>
            <Select
              value={formData.gateType}
              label="Loại Cổng"
              onChange={(e) => setFormData({ ...formData, gateType: e.target.value as 'BUILDING_GATE' | 'ROOM_DOOR' })}
            >
              <MenuItem value="BUILDING_GATE">Cổng Tòa Nhà</MenuItem>
              <MenuItem value="ROOM_DOOR">Cửa Phòng</MenuItem>
            </Select>
          </FormControl>
          
          {formData.gateType === 'BUILDING_GATE' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tòa Nhà</InputLabel>
              <Select
                value={formData.buildingId}
                label="Tòa Nhà"
                onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
              >
                {buildings.map(b => (
                  <MenuItem key={b.buildingId} value={b.buildingId}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {formData.gateType === 'ROOM_DOOR' && (
            <TextField
              fullWidth
              label="Room ID (UUID) - Để trống tạm nếu không dùng"
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            fullWidth
            label="MAC Address (Device ID)"
            value={formData.macAddress}
            onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch 
                checked={formData.active} 
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })} 
              />
            }
            label="Hoạt động (Active)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.name}>Lưu</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity as any} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
