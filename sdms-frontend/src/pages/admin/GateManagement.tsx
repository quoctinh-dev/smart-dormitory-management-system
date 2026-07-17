import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
} from '@mui/material';
import { useState, useEffect } from 'react';

import gateApi, { GateResponse, GateRequest } from '@/api/gateApi';
import roomApi from '@/api/roomApi';
import CustomSkeleton from '@/components/common/CustomSkeleton';
import { snackbar } from '@/utils/snackbar';

export default function GateManagement() {
  const [gates, setGates] = useState<GateResponse[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  const [selectedFloorId, setSelectedFloorId] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<GateResponse | null>(null);


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
        roomApi.getBuildings(),
      ]);
      setGates(Array.isArray(gatesRes) ? gatesRes : (gatesRes as any)?.data || []);
      setBuildings(Array.isArray(buildingsRes) ? buildingsRes : (buildingsRes as any)?.data || []);
    } catch (error: any) {
      console.error('Failed to fetch data', error);
      snackbar.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch Floors when Building changes and gate is ROOM_DOOR
  useEffect(() => {
    if (formData.gateType === 'ROOM_DOOR' && formData.buildingId) {
      roomApi
        .getFloorsByBuilding(formData.buildingId)
        .then((res) => {
          setFloors(Array.isArray(res) ? res : (res as any)?.data || []);
        })
        .catch(() => setFloors([]));
    } else {
      setFloors([]);
      if (formData.gateType === 'ROOM_DOOR' && !formData.buildingId) {
        setSelectedFloorId('');
        if (formData.roomId) setFormData((prev) => ({ ...prev, roomId: '' }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.buildingId, formData.gateType]);

  // Fetch Rooms when Floor changes
  useEffect(() => {
    if (selectedFloorId) {
      roomApi
        .getRoomsByFloor(selectedFloorId)
        .then((res) => {
          setRooms(Array.isArray(res) ? res : (res as any)?.data || []);
        })
        .catch(() => setRooms([]));
    } else {
      setRooms([]);
      if (formData.gateType === 'ROOM_DOOR' && formData.roomId) {
        setFormData((prev) => ({ ...prev, roomId: '' }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFloorId]);

  const handleOpenDialog = async (gate?: GateResponse) => {
    if (gate) {
      setEditingGate(gate);

      // If it's a ROOM_DOOR, we need to fetch the room info to get its building and floor
      if (gate.gateType === 'ROOM_DOOR' && gate.roomId) {
        try {
          const roomRes = await roomApi.getRoomById(gate.roomId);
          const roomData = (roomRes as any)?.data || roomRes;

          setFormData({
            name: gate.name,
            gateType: gate.gateType,
            buildingId: roomData.buildingId || gate.buildingId || '',
            roomId: gate.roomId || '',
            macAddress: gate.macAddress || '',
            active: gate.active,
          });
          setSelectedFloorId(roomData.floorId || '');
        } catch (error: any) {
          console.error('Failed to fetch room info', error);
          setFormData({
            name: gate.name,
            gateType: gate.gateType,
            buildingId: gate.buildingId || '',
            roomId: gate.roomId || '',
            macAddress: gate.macAddress || '',
            active: gate.active,
          });
        }
      } else {
        setFormData({
          name: gate.name,
          gateType: gate.gateType,
          buildingId: gate.buildingId || '',
          roomId: '',
          macAddress: gate.macAddress || '',
          active: gate.active,
        });
        setSelectedFloorId('');
      }
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
      setSelectedFloorId('');
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingGate) {
        await gateApi.updateGate(editingGate.gateId, formData);
        snackbar.success('Cập nhật cổng thành công');
      } else {
        await gateApi.createGate(formData);
        snackbar.success('Thêm mới cổng thành công');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra';
      snackbar.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cổng này?')) {
      try {
        await gateApi.deleteGate(id);
        snackbar.success('Xóa cổng thành công');
        fetchData();
      } catch (error: any) {
        snackbar.error('Lỗi khi xóa cổng');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Cổng (IoT Gates)
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Thêm Cổng Mới
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box p={3}>
            <CustomSkeleton type="table" count={5} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell>
                    <strong>Gate ID (UUID)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Tên Cổng</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Loại Cổng</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Tòa Nhà / Phòng</strong>
                  </TableCell>
                  <TableCell>
                    <strong>MAC Address</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Trạng Thái</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Hành động</strong>
                  </TableCell>
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
              onChange={(e) => {
                const newGateType = e.target.value as 'BUILDING_GATE' | 'ROOM_DOOR';
                setFormData({
                  ...formData,
                  gateType: newGateType,
                  roomId: newGateType === 'BUILDING_GATE' ? '' : formData.roomId,
                });
                if (newGateType === 'BUILDING_GATE') {
                  setSelectedFloorId('');
                }
              }}
            >
              <MenuItem value="BUILDING_GATE">Cổng Tòa Nhà</MenuItem>
              <MenuItem value="ROOM_DOOR">Cửa Phòng</MenuItem>
            </Select>
          </FormControl>

          {/* Dù là cổng tòa nhà hay cửa phòng đều cần chọn tòa nhà */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tòa Nhà</InputLabel>
            <Select
              value={formData.buildingId || ''}
              label="Tòa Nhà"
              onChange={(e) => {
                setFormData({ ...formData, buildingId: e.target.value, roomId: '' });
                setSelectedFloorId('');
              }}
            >
              {buildings.map((b) => (
                <MenuItem key={b.buildingId} value={b.buildingId}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Nếu là Cửa phòng thì sẽ hiện thêm Dropdown Tầng và Phòng (Cascading) */}
          {formData.gateType === 'ROOM_DOOR' && (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tầng</InputLabel>
                <Select
                  value={selectedFloorId || ''}
                  label="Tầng"
                  onChange={(e) => {
                    setSelectedFloorId(e.target.value);
                    setFormData({ ...formData, roomId: '' });
                  }}
                  disabled={!formData.buildingId}
                >
                  {floors.map((f) => (
                    <MenuItem key={f.floorId} value={f.floorId}>
                      Tầng {f.floorNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Phòng</InputLabel>
                <Select
                  value={formData.roomId || ''}
                  label="Phòng"
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  disabled={!selectedFloorId}
                >
                  {rooms.map((r) => (
                    <MenuItem key={r.roomId} value={r.roomId}>
                      {r.roomCode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
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
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.name ||
              (formData.gateType === 'ROOM_DOOR' && !formData.roomId) ||
              (formData.gateType === 'BUILDING_GATE' && !formData.buildingId)
            }
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
