import AddTaskIcon from '@mui/icons-material/AddTask';
import BuildIcon from '@mui/icons-material/Build';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import React from 'react';

import { useRoomActionMenu } from '@/hooks/useRoomActionMenu';
import type { RoomStatus } from '@/types/room';

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
  const {
    anchorEl,
    open,
    handleOpen,
    handleClose,
    handleStatus,
    handleAutoGenerateBeds,
    handleEditRoom,
    handleResetPin,
  } = useRoomActionMenu(roomId, onChangeStatus, onEditRoom, onRefresh);

  const isMaintenance = roomStatus === 'MAINTENANCE';
  const isClosed = roomStatus === 'CLOSED';
  const canGenerateBeds = bedsCount < capacity;

  return (
      <>
        <IconButton
            size="small"
            onClick={handleOpen}
            sx={{ ml: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, color: 'text.secondary' }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>

        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                minWidth: 220,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              },
            }}
        >
          {/* Edit Room */}
          <MenuItem onClick={handleEditRoom} sx={{ py: 1.25 }}>
            <ListItemIcon>
              <EditIcon fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}>
              Sửa thông tin phòng
            </ListItemText>
          </MenuItem>

          {/* Reset PIN */}
          <MenuItem onClick={handleResetPin} sx={{ py: 1.25 }}>
            <ListItemIcon>
              <LockIcon fontSize="small" color="secondary" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}>
              Tạo mới mã PIN (Reset)
            </ListItemText>
          </MenuItem>

          {/* Generate Beds (chỉ hiện nếu số giường < sức chứa) */}
          {canGenerateBeds && (
              <MenuItem onClick={handleAutoGenerateBeds} sx={{ py: 1.25 }}>
                <ListItemIcon>
                  <AddTaskIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}>
                  Sinh giường tự động ({capacity - bedsCount} giường)
                </ListItemText>
              </MenuItem>
          )}

          <Divider sx={{ my: '4px !important' }} />

          {/* Toggle Maintenance */}
          <MenuItem onClick={() => handleStatus(isMaintenance ? 'AVAILABLE' : 'MAINTENANCE')} sx={{ py: 1.25 }}>
            <ListItemIcon>
              <BuildIcon fontSize="small" color={isMaintenance ? 'success' : 'warning'} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}>
              {isMaintenance ? 'Mở lại phòng (AVAILABLE)' : 'Chuyển sang Bảo trì'}
            </ListItemText>
          </MenuItem>

          {/* Toggle Closed */}
          <MenuItem onClick={() => handleStatus(isClosed ? 'AVAILABLE' : 'CLOSED')} sx={{ py: 1.25 }}>
            <ListItemIcon>
              {isClosed ? (
                  <LockOpenIcon fontSize="small" color="success" />
              ) : (
                  <LockIcon fontSize="small" color="error" />
              )}
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}>
              {isClosed ? 'Mở lại phòng (AVAILABLE)' : 'Đóng phòng (CLOSED)'}
            </ListItemText>
          </MenuItem>
        </Menu>
      </>
  );
}