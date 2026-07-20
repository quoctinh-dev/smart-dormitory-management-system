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
import React from 'react';

import { useUpdateRoomForm } from '@/hooks/useUpdateRoomForm';
import type { RoomWithBeds } from '@/types/room';

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
  const { capacity, setCapacity, loading, handleSubmit } = useUpdateRoomForm(open, room, onSuccess);

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
