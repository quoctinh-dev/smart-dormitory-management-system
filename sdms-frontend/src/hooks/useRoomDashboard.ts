// src/hooks/useRoomDashboard.ts
import { useState, useEffect, useCallback } from 'react';

import roomApi from '@/api/roomApi';
import type {
  BuildingResponse,
  FloorResponse,
  RoomWithBeds,
  RoomResponse,
  BedResponse,
} from '@/types/room';
import { snackbar } from '@/utils/snackbar';

export function useRoomDashboard() {
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [roomsWithBeds, setRoomsWithBeds] = useState<RoomWithBeds[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [loading, setLoading] = useState(false);


  // ── Giai đoạn 1: Tải toàn bộ Tòa nhà khi mount ──────────────────────────
  useEffect(() => {
    const fetchBuildings = async () => {
      setLoading(true);

      try {
        const res = await roomApi.getBuildings();
        // axiosClient interceptor unwrap ApiResponse → data là mảng trực tiếp
        const data = (res as any)?.data ?? res;
        setBuildings(Array.isArray(data) ? (data as BuildingResponse[]) : []);
      } catch (err: any) {
        snackbar.error('Không thể tải danh sách tòa nhà.');
        console.error('[useRoomDashboard] fetchBuildings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuildings();
  }, []);

  // ── Giai đoạn 2: Tải Tầng khi đổi Tòa nhà ───────────────────────────────
  useEffect(() => {
    if (!selectedBuilding) {
      setFloors([]);
      setSelectedFloor('');
      setRoomsWithBeds([]);
      return;
    }
    const fetchFloors = async () => {
      setLoading(true);

      try {
        const res = await roomApi.getFloorsByBuilding(selectedBuilding);
        const data = (res as any)?.data ?? res;
        setFloors(Array.isArray(data) ? (data as FloorResponse[]) : []);
        setSelectedFloor('');
        setRoomsWithBeds([]);
      } catch (err: any) {
        snackbar.error('Không thể tải danh sách tầng.');
        console.error('[useRoomDashboard] fetchFloors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFloors();
  }, [selectedBuilding]);

  // ── Giai đoạn 3: Tải Phòng + Giường song song khi chọn Tầng ─────────────
  const fetchRoomsAndBeds = useCallback(async (floorId: string) => {
    if (!floorId) return;
    setLoading(true);

    try {
      const roomsRes = await roomApi.getRoomsByFloor(floorId);
      const roomsData: RoomResponse[] = (roomsRes as any)?.data ?? roomsRes ?? [];

      // Promise.all để gọi beds song song — tối ưu hiệu năng
      const roomsWithBedsList: RoomWithBeds[] = await Promise.all(
        roomsData.map(async (room) => {
          try {
            const bedsRes = await roomApi.getBedsByRoom(room.roomId);
            // axiosClient đã unwrap → bedsRes là BedResponse[]
            const beds: BedResponse[] = (bedsRes as any)?.data ?? bedsRes ?? [];
            return { ...room, beds: Array.isArray(beds) ? beds : [] };
          } catch (err) {
            console.error(`[useRoomDashboard] getBedsByRoom(${room.roomId}):`, err);
            return { ...room, beds: [] };
          }
        })
      );

      setRoomsWithBeds(roomsWithBedsList);
    } catch (err: any) {
      snackbar.error('Không thể tải danh sách phòng.');
      console.error('[useRoomDashboard] fetchRoomsAndBeds:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFloor) {
      fetchRoomsAndBeds(selectedFloor);
    } else {
      setRoomsWithBeds([]);
    }
  }, [selectedFloor, fetchRoomsAndBeds]);

  return {
    buildings,
    floors,
    roomsWithBeds,
    selectedBuilding,
    setSelectedBuilding,
    selectedFloor,
    setSelectedFloor,
    loading,

    refresh: () => {
      if (selectedFloor) fetchRoomsAndBeds(selectedFloor);
    },
  };
}
