import { useState, useEffect } from 'react';

import roomApi from '@/api/room-api';
import { snackbar } from '@/helpers/snackbar';
import type { RoomWithBeds } from '@/types/room';

export const useUpdateRoomForm = (
  open: boolean,
  room: RoomWithBeds | null,
  onSuccess: () => void
) => {
  const [capacity, setCapacity] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && room) {
      setCapacity(room.capacity);
    }
  }, [open, room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !capacity) return;

    const currentBedsCount = room.beds?.length || 0;
    if (Number(capacity) < currentBedsCount) {
      snackbar.error(
        `Sức chứa không được nhỏ hơn số giường vật lý hiện tại (${currentBedsCount} giường).`
      );
      return;
    }

    setLoading(true);
    try {
      await roomApi.updateRoom(room.roomId, {
        capacity: Number(capacity),
        status: room.status,
      });
      snackbar.success('Cập nhật thông tin phòng thành công');
      onSuccess();
    } catch (err: any) {
      snackbar.error(err?.response?.data?.message || 'Lỗi khi cập nhật phòng');
    } finally {
      setLoading(false);
    }
  };

  return {
    capacity,
    setCapacity,
    loading,
    handleSubmit,
  };
};
