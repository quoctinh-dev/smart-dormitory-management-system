// src/pages/admin/RoomManagement/components/FloorFormDialog.tsx
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
import React, { useState, useEffect } from 'react';

import roomApi from '@/api/roomApi';
import type { FloorResponse, BuildingResponse } from '@/types/room';
import { snackbar } from '@/utils/snackbar';

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
  const isEdit = Boolean(floor);
  const [floorNumber, setFloorNumber] = useState<number | ''>('');
  const [gender, setGender] = useState('MALE');
  const [loading, setLoading] = useState(false);

  // Xem tòa nhà có bị gò bó giới tính không
  const isBuildingStrict =
    currentBuilding?.gender === 'MALE' || currentBuilding?.gender === 'FEMALE';
  const strictGender = isBuildingStrict ? currentBuilding.gender : null;

  useEffect(() => {
    if (open) {
      if (floor) {
        setFloorNumber(floor.floorNumber);
        setGender(floor.gender || 'MALE');
      } else {
        setFloorNumber('');
        setGender(strictGender || 'MALE');
      }
    }
  }, [open, floor, strictGender]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (floorNumber === '' || !buildingId) return;

    setLoading(true);
    try {
      if (isEdit) {
        await roomApi.updateFloor(floor!.floorId, {
          gender,
        });
        snackbar.success('Cập nhật tầng thành công');
      } else {
        await roomApi.createFloor({
          buildingId,
          floorNumber: Number(floorNumber),
          gender,
        });
        snackbar.success('Thêm tầng mới thành công');
      }
      onSuccess();
    } catch (err: any) {
      snackbar.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

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
