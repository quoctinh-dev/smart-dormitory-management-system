// src/hooks/useRoomDashboard.js
import { useState, useEffect, useCallback } from 'react';
import roomApi from '@/api/roomApi';

export function useRoomDashboard() {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [roomsWithBeds, setRoomsWithBeds] = useState([]);
  
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [loading, setLoading] = useState(false);

  // Giai đoạn 1: Lấy toàn bộ danh sách Tòa nhà khi khởi tạo
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoading(true);
        const data = await roomApi.getBuildings();
        setBuildings(data || []);
      } catch (error) {
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
        const data = await roomApi.getFloorsByBuilding(selectedBuilding);
        setFloors(data || []);
        setSelectedFloor(''); // Khử vết tầng cũ để tránh lỗi bẻ khóa giao diện
        setRoomsWithBeds([]);
      } catch (error) {
        console.error('Lỗi khi tải danh sách tầng:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFloors();
  }, [selectedBuilding]);

  // Giai đoạn 3: Tổng hợp song song dữ liệu Phòng kèm Giường (Xử lý dứt điểm lỗi undefined ID)
  const fetchRoomsAndBedsDetails = useCallback(async (floorId) => {
    if (!floorId) return;
    try {
      setLoading(true);
      const roomsData = await roomApi.getRoomsByFloor(floorId);
      
      // Đồng bộ nạp dữ liệu giường thông qua Promise.all
      const fullHierarchyData = await Promise.all(
        roomsData.map(async (room) => {
          try {
            // 🌟 GIẢI PHÁP: Quét kiểm tra an toàn cả hai thuộc tính định danh id hoặc roomId từ Backend
            const rId = room.id || room.roomId;
            
            if (!rId) {
              console.warn("Phát hiện một cấu trúc Phòng thiếu ID định danh hợp lệ:", room);
              return { ...room, beds: [] };
            }

            const bedsData = await roomApi.getBedsByRoom(rId);
            return { ...room, beds: bedsData || [] };
          } catch (error) {
            console.error(`Lỗi tải danh sách giường của phòng:`, error);
            return { ...room, beds: [] };
          }
        })
      );
      
      setRoomsWithBeds(fullHierarchyData);
    } catch (error) {
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