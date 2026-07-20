import { useSnackbar } from 'notistack';
import { useState, useEffect, SyntheticEvent } from 'react';

import roomApi from '@/api/room-api';
import { utilityApi } from '@/api/utility-api';
import { BuildingResponse, FloorResponse } from '@/types/room';
import type { RoomUtilityResponse } from '@/types/utility';

export const useUtilityReading = () => {
  const { enqueueSnackbar } = useSnackbar();
  const currentDate = new Date();

  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [utilityType, setUtilityType] = useState<'ELECTRICITY' | 'WATER'>('ELECTRICITY');

  // Filters
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<RoomUtilityResponse[]>([]);
  const [readings, setReadings] = useState<Record<string, number | string>>({});
  const [oldReadings, setOldReadings] = useState<Record<string, number | string>>({});

  useEffect(() => {
    fetchBuildings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      fetchFloors(selectedBuildingId);
      setSelectedFloorId(''); // Reset floor when building changes
    } else {
      setFloors([]);
      setSelectedFloorId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBuildingId]);

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, utilityType, selectedBuildingId, selectedFloorId]);

  const fetchBuildings = async () => {
    try {
      const res = await roomApi.getBuildings();
      setBuildings(res);
    } catch {
      enqueueSnackbar('Lỗi tải danh sách tòa nhà', { variant: 'error' });
    }
  };

  const fetchFloors = async (buildingId: string) => {
    try {
      const res = await roomApi.getFloorsByBuilding(buildingId);
      setFloors(res);
    } catch {
      enqueueSnackbar('Lỗi tải danh sách tầng', { variant: 'error' });
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await utilityApi.getRoomsForRecording(
        month,
        year,
        utilityType,
        selectedBuildingId || undefined,
        selectedFloorId || undefined
      );
      setRooms(res);

      const initialReadings: Record<string, number | string> = {};
      const initialOldReadings: Record<string, number | string> = {};
      res.forEach((room: RoomUtilityResponse) => {
        if (room.newReading !== null && room.newReading !== undefined) {
          initialReadings[room.roomId] = room.newReading;
        }
        if (room.isFirstRecord) {
          initialOldReadings[room.roomId] = ''; // Start empty
        }
      });
      setReadings(initialReadings);
      setOldReadings(initialOldReadings);
    } catch {
      enqueueSnackbar('Lỗi khi tải danh sách phòng', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: SyntheticEvent, newValue: 'ELECTRICITY' | 'WATER') => {
    setUtilityType(newValue);
  };

  const handleReadingChange = (roomId: string, value: string) => {
    setReadings((prev) => ({
      ...prev,
      [roomId]: value === '' ? '' : parseInt(value, 10),
    }));
  };

  const handleOldReadingChange = (roomId: string, value: string) => {
    setOldReadings((prev) => ({
      ...prev,
      [roomId]: value === '' ? '' : parseInt(value, 10),
    }));
  };

  const handleSave = async (room: RoomUtilityResponse) => {
    const newReading = readings[room.roomId];
    const actualOldReading = room.isFirstRecord ? oldReadings[room.roomId] : room.oldReading;

    if (newReading === undefined || newReading === null || newReading === '') {
      enqueueSnackbar('Vui lòng nhập chỉ số mới', { variant: 'warning' });
      return;
    }

    if (room.isFirstRecord && (actualOldReading === undefined || actualOldReading === null || actualOldReading === '')) {
      enqueueSnackbar('Vui lòng nhập chỉ số cũ cho phòng này (lần đầu ghi)', {
        variant: 'warning',
      });
      return;
    }

    if (Number(newReading) < Number(actualOldReading)) {
      enqueueSnackbar(`Chỉ số mới không được nhỏ hơn chỉ số cũ (${actualOldReading})`, {
        variant: 'error',
      });
      return;
    }

    const unit = utilityType === 'ELECTRICITY' ? 'kWh' : 'm3';
    if (
      !window.confirm(
        `Xác nhận chốt ${Number(newReading) - Number(actualOldReading)} ${unit} cho phòng ${room.roomCode}?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await utilityApi.recordUtility(utilityType, {
        roomId: room.roomId,
        month,
        year,
        newReading: Number(newReading),
        oldReading: Number(actualOldReading),
      });
      enqueueSnackbar('Lưu chỉ số thành công!', { variant: 'success' });
      fetchRooms();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Lỗi khi lưu chỉ số', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (room: RoomUtilityResponse) => {
    if (!window.confirm(`Xác nhận hủy chốt số cho phòng ${room.roomCode} trong tháng ${month}/${year}? Lưu ý: Hóa đơn chưa thanh toán liên quan cũng sẽ bị xóa.`)) {
      return;
    }

    try {
      setLoading(true);
      await utilityApi.cancelUtilityRecord(utilityType, room.roomId, month, year);
      enqueueSnackbar('Hủy chốt thành công!', { variant: 'success' });
      fetchRooms();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Lỗi khi hủy chốt', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return {
    month,
    setMonth,
    year,
    setYear,
    utilityType,
    buildings,
    floors,
    selectedBuildingId,
    setSelectedBuildingId,
    selectedFloorId,
    setSelectedFloorId,
    loading,
    rooms,
    readings,
    oldReadings,
    handleTabChange,
    handleReadingChange,
    handleOldReadingChange,
    handleSave,
    handleCancel,
    fetchRooms,
    currentDate,
  };
};
