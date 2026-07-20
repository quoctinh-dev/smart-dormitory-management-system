import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import React from 'react';

import { useFloorForm } from '@/hooks/useFloorForm';
import type { FloorResponse, BuildingResponse } from '@/types/room';

export interface FloorFormDialogProps {
  open: boolean;
  onClose: () => void;
  buildingId: string;
  currentBuilding: BuildingResponse | null;
  floor: FloorResponse | null; // null => Create, else => Edit
  onSuccess: () => void;
}

export default function FloorFormDialog({
  open,
  onClose,
  buildingId,
  currentBuilding,
  floor,
  onSuccess,
}: FloorFormDialogProps) {
  const {
    isEdit,
    floorNumber,
    setFloorNumber,
    gender,
    setGender,
    loading,
    isBuildingStrict,
    handleSubmit,
  } = useFloorForm(open, buildingId, currentBuilding, floor, onSuccess, onClose);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Sửa thông tin Tầng' : 'Thêm Tầng Mới'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            label="Số tầng (VD: 1, 2, 3)"
            type="number"
            fullWidth
            value={floorNumber}
            onChange={(e) => setFloorNumber(e.target.value ? Number(e.target.value) : '')}
            disabled={isEdit} // Không cho đổi số tầng khi sửa
            required
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Giới tính Tầng</InputLabel>
            <Select
              value={gender}
              label="Giới tính Tầng"
              onChange={(e) => setGender(e.target.value)}
              disabled={isBuildingStrict} // Khóa lại nếu Tòa nhà đã chốt giới tính
            >
              <MenuItem value="MALE">Dành cho Nam (MALE)</MenuItem>
              <MenuItem value="FEMALE">Dành cho Nữ (FEMALE)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || floorNumber === ''}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
