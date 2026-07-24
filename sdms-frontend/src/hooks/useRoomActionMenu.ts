import { useState } from 'react';

import roomApi from '@/api/room-api';
import { snackbar } from '@/helpers/snackbar';
import { confirmDialog } from '@/helpers/confirm';

export const useRoomActionMenu = (
  roomId: string,
  onChangeStatus: (roomId: string, status: string) => void,
  onEditRoom: () => void,
  onRefresh: () => void
) => {
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
    const isConfirmed = await confirmDialog({
      title: 'Xác nhận tạo mã PIN',
      message: 'Bạn có chắc chắn muốn tạo mã PIN mới cho phòng này? Mã PIN cũ sẽ bị hủy.',
      confirmText: 'Tạo mã mới'
    });
    if (!isConfirmed) return;

    try {
      const { default: roomPinApi } = await import('@/api/room-pin-api');
      await roomPinApi.resetRoomPin(roomId);
      snackbar.success('Đã reset mã PIN phòng thành công');
      onRefresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể reset mã PIN';
      snackbar.error(msg);
    }
  };

  const handleDeleteRoom = async () => {
    handleClose();
    const isConfirmed = await confirmDialog({
      title: 'Xóa phòng',
      message: 'Bạn có chắc muốn xóa phòng này? (Chỉ áp dụng khi phòng trống)'
    });
    if (!isConfirmed) return;
    
    try {
      await roomApi.deleteRoom(roomId);
      snackbar.success('Xóa phòng thành công');
      onRefresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể xóa phòng';
      snackbar.error(msg);
    }
  };

  return {
    anchorEl,
    open,
    handleOpen,
    handleClose,
    handleStatus,
    handleAutoGenerateBeds,
    handleEditRoom,
    handleResetPin,
    handleDeleteRoom,
  };
};
