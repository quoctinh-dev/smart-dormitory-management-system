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

import { useBuildingForm } from '@/hooks/useBuildingForm';
import type { BuildingResponse, BuildingStatus } from '@/types/room';

export interface BuildingFormDialogProps {
  open: boolean;
  onClose: () => void;
  building: BuildingResponse | null; // null => Create, else => Edit
  onSuccess: () => void;
}

export default function BuildingFormDialog({
  open,
  onClose,
  building,
  onSuccess,
}: BuildingFormDialogProps) {
  const {
    isEdit,
    code,
    setCode,
    name,
    setName,
    description,
    setDescription,
    status,
    setStatus,
    gender,
    setGender,
    loading,
    handleSubmit,
  } = useBuildingForm(open, building, onSuccess, onClose);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Sửa Tòa nhà' : 'Thêm Tòa nhà Mới'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            label="Mã tòa nhà (VD: A, B, C)"
            type="text"
            fullWidth
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isEdit} // Không cho sửa mã khi edit
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Tên tòa nhà (VD: Tòa nhà A)"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Mô tả"
            type="text"
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Loại tòa nhà (Giới tính)</InputLabel>
            <Select
              value={gender}
              label="Loại tòa nhà (Giới tính)"
              onChange={(e) => setGender(e.target.value)}
            >
              <MenuItem value="MIXED">Nam & Nữ (MIXED)</MenuItem>
              <MenuItem value="MALE">Tòa Nam (MALE)</MenuItem>
              <MenuItem value="FEMALE">Tòa Nữ (FEMALE)</MenuItem>
            </Select>
          </FormControl>

          {isEdit && (
            <FormControl fullWidth margin="dense">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={status}
                label="Trạng thái"
                onChange={(e) => setStatus(e.target.value as BuildingStatus)}
              >
                <MenuItem value="ACTIVE">Hoạt động (ACTIVE)</MenuItem>
                <MenuItem value="MAINTENANCE">Bảo trì (MAINTENANCE)</MenuItem>
                <MenuItem value="CLOSED">Đóng cửa (CLOSED)</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !code.trim() || !name.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
