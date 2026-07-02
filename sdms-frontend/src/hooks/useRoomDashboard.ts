import { useState, useEffect, useCallback } from 'react';

import roomApi from '@/api/roomApi';
import { IRoom } from '@/pages/admin/RoomManagement/DashboardView';

export interface IBuilding {
  id?: string;
  buildingId?: string;
  _id?: string;
  name?: string;
  [key: string]: any;
}

export interface IFloor {
  id?: string;
  floorId?: string;
  _id?: string;
  floorNumber?: string | number;
  name?: string;
  [key: string]: any;
}

export function useRoomDashboard() {
  const [buildings, setBuildings] = useState<IBuilding[]>([]);
  const [floors, setFloors] = useState<IFloor[]>([]);
  const [roomsWithBeds, setRoomsWithBeds] = useState<IRoom[]>([]);

  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [loading, setLoading] = useState(false);

  // Giai đoạn 1: Lấy toàn bộ danh sách Tòa nhà khi khởi tạo
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoading(true);
        const res = await roomApi.getBuildings();
        const data = (res as any)?.data || res;
        setBuildings((data as IBuilding[]) || []);
      } catch (error: any) {
        console.error('Lỗi khi tải danh sách tòa nhà:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBuildings();
  }, []);

  // Giai đoạn 2: Tải danh sách Tầng tương ứng khi đổi Tòa nhà
  useEffect(() => {
    if (!selectedBuilding) {
      setFloors([]);
      setSelectedFloor('');
      setRoomsWithBeds([]);
      return;
    }

    const fetchFloors = async () => {
      try {
        setLoading(true);
        const res = await roomApi.getFloorsByBuilding(selectedBuilding);
        const data = (res as any)?.data || res;
        setFloors((data as IFloor[]) || []);
        setSelectedFloor(''); // Khử vết tầng cũ để tránh lỗi bẻ khóa giao diện
        setRoomsWithBeds([]);
      } catch (error: any) {
        console.error('Lỗi khi tải danh sách tầng:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFloors();
  }, [selectedBuilding]);

  // Giai đoạn 3: Tổng hợp song song dữ liệu Phòng kèm Giường (Xử lý dứt điểm lỗi undefined ID)
  const fetchRoomsAndBedsDetails = useCallback(async (floorId: string) => {
    if (!floorId) return;
    try {
      setLoading(true);
      const roomsRes = await roomApi.getRoomsByFloor(floorId);
      const roomsData = (roomsRes as any)?.data || roomsRes || [];

      // Đồng bộ nạp dữ liệu giường thông qua Promise.all
      const fullHierarchyData = await Promise.all(
        roomsData.map(async (room: any) => {
          try {
            // 🌟 GIẢI PHÁP: Quét kiểm tra an toàn cả hai thuộc tính định danh id hoặc roomId từ Backend
            const rId = room.id || room.roomId;

            if (!rId) {
              console.warn('Phát hiện một cấu trúc Phòng thiếu ID định danh hợp lệ:', room);
              return { ...room, beds: [] };
            }

            const bedsData = await roomApi.getBedsByRoom(rId);
            return { ...room, beds: bedsData || [] };
          } catch (error: any) {
            console.error(`Lỗi tải danh sách giường của phòng:`, error);
            return { ...room, beds: [] };
          }
        })
      );

      setRoomsWithBeds(fullHierarchyData);
    } catch (error: any) {
      console.error('Lỗi trong quá trình gộp dữ liệu phòng & giường:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Theo dõi cập nhật danh sách phòng/giường khi chọn Tầng xong
  useEffect(() => {
    if (selectedFloor) {
      fetchRoomsAndBedsDetails(selectedFloor);
    } else {
      setRoomsWithBeds([]);
    }
  }, [selectedFloor, fetchRoomsAndBedsDetails]);

  return {
    buildings,
    floors,
    roomsWithBeds,
    selectedBuilding,
    setSelectedBuilding,
    selectedFloor,
    setSelectedFloor,
    loading,
    refresh: () => fetchRoomsAndBedsDetails(selectedFloor),
  };
}
