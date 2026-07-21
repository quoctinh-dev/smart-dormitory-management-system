import { useState, useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import axiosClient from '@/api/axios-client';

export type Student = {
  studentId: string;
  studentCode: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  cccd: string;
  cccdIssueDate: string;
  cccdIssuePlace: string;
  permanentAddress: string;
  ethnicity: string;
  religion: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  contactAddress: string;
  studentClass: string;
  major: string;
  faculty: string;
  academicYear: string;
  status: string;
  rfidCode?: string;
  avatarUrl?: string;
  bedCode?: string;
  roomCode?: string;
};

export function useStudentManagement() {
  const { enqueueSnackbar } = useSnackbar();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        size: rowsPerPage,
      };
      if (search) params.search = search;
      if (status !== 'ALL') params.status = status;

      const data = await axiosClient.get<any, any>('/v1/students', { params });
      setStudents(data.content);
      setTotalElements(data.totalElements);
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar('Lỗi khi tải danh sách sinh viên', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, status, enqueueSnackbar]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleUpdateStudent = async (studentId: string, payload: Partial<Student>) => {
    try {
      await axiosClient.patch(`/v1/students/${studentId}`, payload);
      enqueueSnackbar('Cập nhật thông tin thành công', { variant: 'success' });
      fetchStudents();
      return true;
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar('Cập nhật thất bại', { variant: 'error' });
      return false;
    }
  };

  const handleAssignRfid = async (studentId: string, rfidCode: string) => {
    try {
      await axiosClient.post(`/v1/students/${studentId}/rfid`, null, {
        params: { rfidCode }
      });
      enqueueSnackbar('Gán thẻ RFID thành công', { variant: 'success' });
      fetchStudents();
      return true;
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.response?.data?.message || 'Gán RFID thất bại', { variant: 'error' });
      return false;
    }
  };

  return {
    students,
    loading,
    totalElements,
    page,
    rowsPerPage,
    search,
    status,
    setPage,
    setRowsPerPage,
    setSearch,
    setStatus,
    handleUpdateStudent,
    handleAssignRfid,
    fetchStudents,
  };
}
