import confetti from 'canvas-confetti';
import { useState } from 'react';

import checkInApi from '@/api/check-in-api';

export interface ICheckInStudentData {
  assignmentId: string;
  portraitUrl?: string;
  studentName: string;
  studentCode: string;
  cccd: string;
  gender: string;
  buildingName: string;
  floorName: string;
  roomName: string;
  bedName: string;
  [key: string]: any;
}

export const useCheckIn = () => {
  const [cccd, setCccd] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<ICheckInStudentData | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSearch = async () => {
    const cleanCccd = cccd.trim();
    if (!cleanCccd || (cleanCccd.length !== 9 && cleanCccd.length !== 12)) return;

    setLoading(true);
    setError(null);
    setSuccessMsg('');
    setStudentData(null);

    try {
      const res = await checkInApi.searchStudent(cleanCccd);
      setStudentData(res as unknown as ICheckInStudentData);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Không tìm thấy dữ liệu xếp phòng của sinh viên này.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!studentData?.assignmentId) return;
    setCheckInLoading(true);
    setError(null);
    setSuccessMsg('');

    try {
      // Gọi API sang Backend
      const res = await checkInApi.confirmCheckIn(studentData.assignmentId);

      // 🌟 ĐỒNG BỘ CHUẨN: Bốc đúng trường "message" từ Map.of Backend trả về
      const msg = res?.message || `Sinh viên ${studentData.studentName} đã nhận phòng thành công!`;
      setSuccessMsg(msg);

      setStudentData(null);
      setCccd('');

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899'],
      });
    } catch (err: any) {
      console.error('Check-in error object:', err);
      // 🌟 ĐỒNG BỘ CHUẨN: Đọc cả chuỗi lỗi thô nếu lỗi trả về dạng phẳng do interceptor đẩy ra
      setError(
        err?.message || err.response?.data?.message || 'Đã xảy ra lỗi hệ thống khi xử lý Check-in.'
      );
    } finally {
      setCheckInLoading(false);
    }
  };

  return {
    cccd,
    setCccd,
    loading,
    checkInLoading,
    error,
    studentData,
    successMsg,
    handleSearch,
    handleCheckIn,
  };
};
