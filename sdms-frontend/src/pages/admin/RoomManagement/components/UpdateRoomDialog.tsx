import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Stack,
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
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 600, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            Cập nhật Phòng {room.roomCode}
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5, overflow: 'visible' }}>
            <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                Lưu ý: Mã phòng không được phép thay đổi để đảm bảo tính toàn vẹn dữ liệu định danh của
                hệ thống và thiết bị IoT.
              </Typography>

              <TextField
                  label="Sức chứa mới (số giường tối đa)"
                  type="number"
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : '')}
                  required
                  slotProps={{
                    htmlInput: { min: 1, max: 20 },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
                onClick={onClose}
                color="inherit"
                disabled={loading}
                sx={{ textTransform: 'none', borderRadius: 1.5, color: 'text.secondary' }}
            >
              Hủy
            </Button>
            <Button
                type="submit"
                variant="contained"
                disableElevation
                disabled={loading || !capacity}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 3 }}
            >
              Lưu thay đổi
            </Button>
          </DialogActions>
        </form>
      </Dialog>
  );
}