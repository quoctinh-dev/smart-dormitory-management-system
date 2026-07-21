import axiosClient from './axios-client';
import { StudentProfileResponse } from '../types/student';

const studentApi = {
  // Lấy danh sách tất cả sinh viên có phân trang và tìm kiếm (search by studentCode or fullName)
  getAllStudents(params: { page: number; size: number; search?: string }): Promise<{ content: StudentProfileResponse[]; totalElements: number }> {
    return axiosClient.get('/v1/students', { params });
  },
};

export default studentApi;
