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
  TablePagination,
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
import { alpha } from '@mui/material/styles';
import { useState, useEffect } from 'react';

import gateApi from '@/api/gate-api';
import roomApi from '@/api/room-api';
import CustomSkeleton from '@/components/common/CustomSkeleton';
import { snackbar } from '@/helpers/snackbar';
import type { GateResponse, GateRequest } from '@/types/gate';

export default function GateManagement() {
  const [gates, setGates] = useState<GateResponse[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  const [selectedFloorId, setSelectedFloorId] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<GateResponse | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState<GateRequest>({
    name: '',
    gateType: 'BUILDING_GATE',
    buildingId: '',
    roomId: '',
    macAddress: '',
    active: true,
  });

  const [filterBuilding, setFilterBuilding] = useState<string>('');
  const [filterGateType, setFilterGateType] = useState<string>('');

  const filteredGates = gates.filter((gate) => {
    if (filterBuilding && gate.buildingId !== filterBuilding) return false;
    if (filterGateType && gate.gateType !== filterGateType) return false;
    return true;
  });

  const paginatedGates = filteredGates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
        if (formData.roomId) setFormData((prev: any) => ({ ...prev, roomId: '' }));
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
        setFormData((prev: any) => ({ ...prev, roomId: '' }));
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
      } catch {
        snackbar.error('Lỗi khi xóa cổng');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý cổng (IoT Gates)
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Thêm cổng mới
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }} elevation={0} variant="outlined">
        <Typography variant="subtitle2" sx={{ mr: 1 }}>Bộ lọc:</Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Loại cổng</InputLabel>
          <Select
            value={filterGateType}
            label="Loại cổng"
            onChange={(e) => {
              setFilterGateType(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">Tất cả loại</MenuItem>
            <MenuItem value="BUILDING_GATE">Cổng tòa nhà</MenuItem>
            <MenuItem value="ROOM_DOOR">Cửa phòng</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Tòa nhà</InputLabel>
          <Select
            value={filterBuilding}
            label="Tòa nhà"
            onChange={(e) => {
              setFilterBuilding(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">Tất cả tòa nhà</MenuItem>
            {buildings.map((b) => (
              <MenuItem key={b.buildingId} value={b.buildingId}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper
        elevation={3}
        sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}
      >
        {loading ? (
          <Box p={3}>
            <CustomSkeleton type="table" count={5} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Gate ID (UUID)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên cổng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Loại cổng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tòa nhà / phòng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>MAC Address</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedGates.map((gate) => (
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
            <TablePagination
              component="div"
              count={filteredGates.length}
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
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGate ? 'Cập nhật cổng' : 'Thêm cổng mới'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Tên cổng"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Loại cổng</InputLabel>
            <Select
              value={formData.gateType}
              label="Loại cổng"
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
              <MenuItem value="BUILDING_GATE">Cổng tòa nhà</MenuItem>
              <MenuItem value="ROOM_DOOR">Cửa phòng</MenuItem>
            </Select>
          </FormControl>

          {/* Dù là cổng tòa nhà hay cửa phòng đều cần chọn tòa nhà */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tòa nhà</InputLabel>
            <Select
              value={formData.buildingId || ''}
              label="Tòa nhà"
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
            label="Hoạt động (active)"
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
