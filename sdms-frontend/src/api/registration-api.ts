import axiosClient from './axios-client';
import {
  RegistrationPeriodResponse,
  CreateRegistrationPeriodRequest,
  UpdateRegistrationPeriodRequest,
  EligibilityImportResponse,
  EligibilityResponse,
  Page,
  CheckEligibilityRequest,
  CheckEligibilityResponse,
} from '../types/registration';

const ADMIN_PREFIX = '/v1/admin/registration-periods';
const STUDENT_PREFIX = '/v1/registrations';

// =========================================================================
// 1. PHÂN HỆ QUẢN LÝ DÀNH CHO ADMIN & STAFF
// =========================================================================
export const adminRegistrationApi = {
  /**
   * Lấy danh sách tất cả các đợt đăng ký ký túc xá
   */
  getAllPeriods: (): Promise<RegistrationPeriodResponse[]> => {
    return axiosClient.get(ADMIN_PREFIX);
  },

  /**
   * Tạo một đợt đăng ký lưu trú mới
   */
  createPeriod: (data: CreateRegistrationPeriodRequest): Promise<RegistrationPeriodResponse> => {
    return axiosClient.post(ADMIN_PREFIX, data);
  },

  /**
   * Cập nhật thông tin chi tiết của một đợt đăng ký cụ thể
   */
  updatePeriod: (
    id: string,
    data: UpdateRegistrationPeriodRequest
  ): Promise<RegistrationPeriodResponse> => {
    return axiosClient.patch(`${ADMIN_PREFIX}/${id}`, data);
  },

  /**
   * Kích hoạt đợt đăng ký hệ thống (Tự động tắt các đợt khác)
   */
  activatePeriod: (id: string): Promise<void> => {
    return axiosClient.patch(`${ADMIN_PREFIX}/${id}/activate`);
  },

  /**
   * Tạm dừng/Tắt đợt đăng ký đang hoạt động
   */
  deactivatePeriod: (id: string): Promise<void> => {
    return axiosClient.patch(`${ADMIN_PREFIX}/${id}/deactivate`);
  },

  /**
   * Xóa cứng đợt đăng ký (Hard delete)
   */
  deletePeriod: (id: string): Promise<void> => {
    return axiosClient.delete(`${ADMIN_PREFIX}/${id}`);
  },

  /**
   * Import danh sách sinh viên đủ điều kiện từ file Excel
   */
  importEligibility: (periodId: string, file: File): Promise<EligibilityImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return axiosClient.post(`${ADMIN_PREFIX}/${periodId}/eligibilities/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Xem danh sách sinh viên đủ điều kiện của một đợt (Phân trang)
   */
  getEligibilities: (
    periodId: string,
    keyword: string = '',
    page = 0,
    size = 10
  ): Promise<Page<EligibilityResponse>> => {
    return axiosClient.get(`${ADMIN_PREFIX}/${periodId}/eligibilities`, {
      params: { keyword, page, size },
    });
  },

  /**
   * Xóa một sinh viên khỏi danh sách đủ điều kiện
   */
  deleteEligibility: (periodId: string, eligibilityId: string): Promise<void> => {
    return axiosClient.delete(`${ADMIN_PREFIX}/${periodId}/eligibilities/${eligibilityId}`);
  },

  /**
   * Xóa toàn bộ sinh viên khỏi danh sách đủ điều kiện
   */
  deleteAllEligibilities: (periodId: string): Promise<void> => {
    return axiosClient.delete(`${ADMIN_PREFIX}/${periodId}/eligibilities`);
  },
};

// =========================================================================
// 2. PHÂN HỆ ĐĂNG KÝ CÔNG KHAI DÀNH CHO SINH VIÊN
// =========================================================================
export const studentRegistrationApi = {
  /**
   * Yêu cầu gửi mã OTP để xác thực Email trước khi đăng ký
   */
  requestOtp: (data: { email: string }): Promise<void> => {
    return axiosClient.post(`${STUDENT_PREFIX}/request-otp`, data);
  },

  /**
   * Kiểm tra điều kiện tham gia đăng ký ký túc xá của sinh viên
   */
  checkEligibility: (data: CheckEligibilityRequest): Promise<CheckEligibilityResponse> => {
    return axiosClient.post(`${STUDENT_PREFIX}/check-eligibility`, data);
  },
};
