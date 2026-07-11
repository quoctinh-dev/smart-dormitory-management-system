// src/pages/admin/RoomManagement/components/RoomActionMenu.tsx
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BuildIcon from '@mui/icons-material/Build';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AddTaskIcon from '@mui/icons-material/AddTask';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import React, { useState } from 'react';
import type { RoomStatus } from '@/types/room';
import roomApi from '@/api/roomApi';
import { snackbar } from '@/utils/snackbar';

export interface RoomActionMenuProps {
  roomId: string;
  roomStatus: RoomStatus;
  bedsCount?: number;
  capacity?: number;
  onChangeStatus: (roomId: string, status: string) => void;
  onEditRoom: () => void;
  onRefresh: () => void;
}

export default function RoomActionMenu({
  roomId,
  roomStatus,
  bedsCount = 0,
  capacity = 0,
  onChangeStatus,
  onEditRoom,
  onRefresh,
}: RoomActionMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleStatus = (status: string) => {
    handleClose();
    onChangeStatus(roomId, status);
  };

  const handleAutoGenerateBeds = async () => {
    handleClose();
    try {
      await roomApi.autoGenerateBeds(roomId);
      snackbar.success('Đã sinh giường tự động thành công');
      onRefresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể sinh giường tự động';
      snackbar.error(msg);
    }
  };

  const handleEditRoom = () => {
    handleClose();
    onEditRoom();
  };

  const handleResetPin = async () => {
    handleClose();
    if (!window.confirm('Bạn có chắc chắn muốn tạo mã PIN mới cho phòng này? Mã PIN cũ sẽ bị hủy.')) return;
    try {
      const { default: roomPinApi } = await import('@/api/roomPinApi');
      await roomPinApi.resetRoomPin(roomId);
      snackbar.success('Đã reset mã PIN phòng thành công');
      onRefresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể reset mã PIN';
      snackbar.error(msg);
    }
  };

  const isMaintenance = roomStatus === 'MAINTENANCE';
  const isClosed = roomStatus === 'CLOSED';
  const canGenerateBeds = bedsCount < capacity;

  return (
    <>
      <IconButton size="small" onClick={handleOpen} sx={{ ml: 0.5 }}>
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Edit Room */}
        <MenuItem onClick={handleEditRoom}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText>Sửa thông tin phòng</ListItemText>
        </MenuItem>

        {/* Reset PIN */}
        <MenuItem onClick={handleResetPin}>
          <ListItemIcon>
            <LockIcon fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText>Tạo mới mã PIN (Reset)</ListItemText>
        </MenuItem>

        {/* Generate Beds (chỉ hiện nếu số giường < sức chứa) */}
        {canGenerateBeds && (
          <MenuItem onClick={handleAutoGenerateBeds}>
            <ListItemIcon>
              <AddTaskIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Sinh giường tự động ({capacity - bedsCount} giường)</ListItemText>
          </MenuItem>
        )}

        <Divider />

        {/* Toggle Maintenance */}
        <MenuItem onClick={() => handleStatus(isMaintenance ? 'AVAILABLE' : 'MAINTENANCE')}>
          <ListItemIcon>
            <BuildIcon fontSize="small" color={isMaintenance ? 'success' : 'warning'} />
          </ListItemIcon>
          <ListItemText>
            {isMaintenance ? 'Mở lại phòng (AVAILABLE)' : 'Chuyển sang Bảo trì'}
          </ListItemText>
        </MenuItem>

        {/* Toggle Closed */}
        <MenuItem onClick={() => handleStatus(isClosed ? 'AVAILABLE' : 'CLOSED')}>
          <ListItemIcon>
            {isClosed
              ? <LockOpenIcon fontSize="small" color="success" />
              : <LockIcon fontSize="small" color="error" />}
          </ListItemIcon>
          <ListItemText>
            {isClosed ? 'Mở lại phòng (AVAILABLE)' : 'Đóng phòng (CLOSED)'}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
