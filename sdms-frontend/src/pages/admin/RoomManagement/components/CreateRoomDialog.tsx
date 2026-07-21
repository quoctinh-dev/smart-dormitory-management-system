import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Stack,
} from '@mui/material';
import React from 'react';

import { useCreateRoomForm } from '@/hooks/useCreateRoomForm';

export interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
  floorId: string;
  onSuccess: () => void;
}

export default function CreateRoomDialog({
                                           open,
                                           onClose,
                                           floorId,
                                           onSuccess,
                                         }: CreateRoomDialogProps) {
  const { roomCode, setRoomCode, capacity, setCapacity, loading, handleSubmit } = useCreateRoomForm(
      floorId,
      onSuccess
  );

  return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 600, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            Thêm Phòng Mới
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5, overflow: 'visible' }}>
            <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
              <TextField
                  autoFocus
                  label="Mã phòng (vd: A101)"
                  type="text"
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
              <TextField
                  label="Sức chứa (số giường)"
                  type="number"
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : '')}
                  required
                  slotProps={{
                    htmlInput: { min: 1, max: 12 },
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
                disabled={loading || !roomCode.trim() || !capacity}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 3 }}
            >
              Tạo phòng
            </Button>
          </DialogActions>
        </form>
      </Dialog>
  );
}