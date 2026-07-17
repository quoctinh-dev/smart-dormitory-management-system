// src/pages/admin/RoomManagement/components/UpdateRoomDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import roomApi from '@/api/roomApi';
import type { RoomWithBeds } from '@/types/room';
import { snackbar } from '@/utils/snackbar';

export interface UpdateRoomDialogProps {
  open: boolean;
  onClose: () => void;
  room: RoomWithBeds | null;
  onSuccess: () => void;
}

export default function UpdateRoomDialog({
  open,
  onClose,
  room,
  onSuccess,
}: UpdateRoomDialogProps) {
  const [capacity, setCapacity] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  // Khởi tạo giá trị khi mở form
  useEffect(() => {
    if (open && room) {
      setCapacity(room.capacity);
    }
  }, [open, room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !capacity) return;

    // Không cho giảm sức chứa xuống dưới số giường thực tế
    const currentBedsCount = room.beds?.length || 0;
    if (Number(capacity) < currentBedsCount) {
      snackbar.error(
        `Sức chứa không được nhỏ hơn số giường vật lý hiện tại (${currentBedsCount} giường).`
      );
      return;
    }

    setLoading(true);
    try {
      await roomApi.updateRoom(room.roomId, {
        capacity: Number(capacity),
        status: room.status,
      });
      snackbar.success('Cập nhật thông tin phòng thành công');
      onSuccess();
    } catch (err: any) {
      snackbar.error(err?.response?.data?.message || 'Lỗi khi cập nhật phòng');
    } finally {
      setLoading(false);
    }
  };

  if (!room) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Cập nhật Phòng {room.roomCode}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Lưu ý: Mã phòng không được phép thay đổi để đảm bảo tính toàn vẹn dữ liệu định danh của
            hệ thống và thiết bị IoT.
          </Typography>

          <TextField
            margin="dense"
            label="Sức chứa mới (số giường tối đa)"
            type="number"
            fullWidth
            variant="outlined"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : '')}
            required
            slotProps={{
              htmlInput: { min: 1, max: 20 },
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
            disabled={loading || !capacity}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
