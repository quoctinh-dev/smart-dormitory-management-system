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
  Stack,
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
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 600, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            {isEdit ? 'Sửa thông tin Tầng' : 'Thêm Tầng Mới'}
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5, overflow: 'visible' }}>
            <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
              <TextField
                  label="Số tầng (VD: 1, 2, 3)"
                  type="number"
                  fullWidth
                  size="small"
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(e.target.value ? Number(e.target.value) : '')}
                  disabled={isEdit} // Không cho đổi số tầng khi sửa
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Giới tính Tầng</InputLabel>
                <Select
                    value={gender}
                    label="Giới tính Tầng"
                    onChange={(e) => setGender(e.target.value)}
                    disabled={isBuildingStrict} // Khóa lại nếu Tòa nhà đã chốt giới tính
                    sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="MALE">Dành cho Nam (MALE)</MenuItem>
                  <MenuItem value="FEMALE">Dành cho Nữ (FEMALE)</MenuItem>
                </Select>
              </FormControl>
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
                disabled={loading || floorNumber === ''}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 3 }}
            >
              {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
  );
}