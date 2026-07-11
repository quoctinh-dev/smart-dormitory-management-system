// src/pages/admin/RoomManagement/components/CreateRoomDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import roomApi from '@/api/roomApi';
import { snackbar } from '@/utils/snackbar';

export interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
  floorId: string;
  onSuccess: () => void;
}

export default function CreateRoomDialog({ open, onClose, floorId, onSuccess }: CreateRoomDialogProps) {
  const [roomCode, setRoomCode] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !capacity) return;

    setLoading(true);
    try {
      await roomApi.createRoom({
        floorId,
        roomCode: roomCode.trim(),
        capacity: Number(capacity),
      });
      snackbar.success('Thêm phòng mới thành công');
      setRoomCode('');
      setCapacity('');
      onSuccess();
    } catch (err: any) {
      snackbar.error(err?.response?.data?.message || 'Lỗi khi thêm phòng mới');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Thêm Phòng Mới</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Mã phòng (vd: A101)"
            type="text"
            fullWidth
            variant="outlined"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Sức chứa (số giường)"
            type="number"
            fullWidth
            variant="outlined"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : '')}
            required
            slotProps={{
              htmlInput: { min: 1, max: 12 }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !roomCode.trim() || !capacity}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            Tạo phòng
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
