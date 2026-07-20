import { useState } from 'react';

import roomApi from '@/api/room-api';
import { snackbar } from '@/helpers/snackbar';

export const useCreateRoomForm = (floorId: string, onSuccess: () => void) => {
  const [roomCode, setRoomCode] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !capacity) return;

    setLoading(true);
    try {
      await roomApi.createRoom({
        floorId,
        roomCode: roomCode.trim(),
        capacity: Number(capacity),
      });
      snackbar.success('Thêm phòng mới thành công');
      setRoomCode('');
      setCapacity('');
      onSuccess();
    } catch (err: any) {
      snackbar.error(err?.response?.data?.message || 'Lỗi khi thêm phòng mới');
    } finally {
      setLoading(false);
    }
  };

  return {
    roomCode,
    setRoomCode,
    capacity,
    setCapacity,
    loading,
    handleSubmit,
  };
};
