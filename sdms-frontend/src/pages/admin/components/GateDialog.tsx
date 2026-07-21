import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';

import gateApi from '@/api/gate-api';
import roomApi from '@/api/room-api';
import { snackbar } from '@/helpers/snackbar';
import type { GateRequest, GateResponse } from '@/types/gate';

interface GateDialogProps {
  open: boolean;
  onClose: () => void;
  editingGate: GateResponse | null;
  buildings: any[];
  onSuccess: () => void;
}

export default function GateDialog({
  open,
  onClose,
  editingGate,
  buildings,
  onSuccess,
}: GateDialogProps) {
  const [floors, setFloors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  
  const [formData, setFormData] = useState<GateRequest>({
    name: '',
    gateType: 'BUILDING_GATE',
    buildingId: '',
    roomId: '',
    macAddress: '',
    active: true,
  });

  // Reset or populate form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (editingGate) {
        // If it's a ROOM_DOOR, fetch room info to get building and floor
        if (editingGate.gateType === 'ROOM_DOOR' && editingGate.roomId) {
          roomApi
            .getRoomById(editingGate.roomId)
            .then((res) => {
              const roomData = (res as any)?.data || res;
              setFormData({
                name: editingGate.name,
                gateType: editingGate.gateType,
                buildingId: roomData.buildingId || editingGate.buildingId || '',
                roomId: editingGate.roomId || '',
                macAddress: editingGate.macAddress || '',
                active: editingGate.active,
              });
              setSelectedFloorId(roomData.floorId || '');
            })
            .catch(() => {
              setFormData({
                name: editingGate.name,
                gateType: editingGate.gateType,
                buildingId: editingGate.buildingId || '',
                roomId: editingGate.roomId || '',
                macAddress: editingGate.macAddress || '',
                active: editingGate.active,
              });
            });
        } else {
          setFormData({
            name: editingGate.name,
            gateType: editingGate.gateType,
            buildingId: editingGate.buildingId || '',
            roomId: '',
            macAddress: editingGate.macAddress || '',
            active: editingGate.active,
          });
          setSelectedFloorId('');
        }
      } else {
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
    }
  }, [open, editingGate]);

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
  }, [selectedFloorId]);

  const handleSubmit = async () => {
    try {
      if (editingGate) {
        await gateApi.updateGate(editingGate.gateId, formData);
        snackbar.success('Cập nhật cổng thành công');
      } else {
        await gateApi.createGate(formData);
        snackbar.success('Thêm mới cổng thành công');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra';
      snackbar.error(msg);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
        <Button onClick={onClose}>Hủy</Button>
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
  );
}
