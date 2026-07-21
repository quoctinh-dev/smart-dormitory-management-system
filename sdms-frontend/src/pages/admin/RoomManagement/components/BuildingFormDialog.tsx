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
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 600, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            {isEdit ? 'Sửa Tòa nhà' : 'Thêm Tòa nhà Mới'}
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5, overflow: 'visible' }}>
            <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
              <TextField
                  label="Mã tòa nhà (VD: A, B, C)"
                  type="text"
                  fullWidth
                  size="small"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isEdit} // Không cho sửa mã khi edit
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
              <TextField
                  label="Tên tòa nhà (VD: Tòa nhà A)"
                  type="text"
                  fullWidth
                  size="small"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
              <TextField
                  label="Mô tả"
                  type="text"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Loại tòa nhà (Giới tính)</InputLabel>
                <Select
                    value={gender}
                    label="Loại tòa nhà (Giới tính)"
                    onChange={(e) => setGender(e.target.value)}
                    sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="MIXED">Nam & Nữ (MIXED)</MenuItem>
                  <MenuItem value="MALE">Tòa Nam (MALE)</MenuItem>
                  <MenuItem value="FEMALE">Tòa Nữ (FEMALE)</MenuItem>
                </Select>
              </FormControl>

              {isEdit && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                        value={status}
                        label="Trạng thái"
                        onChange={(e) => setStatus(e.target.value as BuildingStatus)}
                        sx={{ borderRadius: 1.5 }}
                    >
                      <MenuItem value="ACTIVE">Hoạt động (ACTIVE)</MenuItem>
                      <MenuItem value="MAINTENANCE">Bảo trì (MAINTENANCE)</MenuItem>
                      <MenuItem value="CLOSED">Đóng cửa (CLOSED)</MenuItem>
                    </Select>
                  </FormControl>
              )}
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
                disabled={loading || !code.trim() || !name.trim()}
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