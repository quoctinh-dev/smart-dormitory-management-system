import axiosClient from './axiosClient';

const ADMIN_PREFIX = '/v1/admin/registration-periods';
const STUDENT_PREFIX = '/v1/registrations';

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Trạng thái phản hồi từ Backend (true/false)
 * @property {string} message - Thông điệp nghiệp vụ từ hệ thống
 * @property {any} data - Dữ liệu trả về từ Spring Boot
 */

// =========================================================================
// 1. PHÂN HỆ QUẢN LÝ DÀNH CHO ADMIN & STAFF (Named Export)
// =========================================================================
export const adminRegistrationApi = {
  
  // --- NHÓM ĐỢT ĐĂNG KÝ ---

  /**
   * Lấy danh sách tất cả các đợt đăng ký ký túc xá
   * Backend: GET /api/v1/admin/registration-periods
   * @returns {Promise<ApiResponse>} List<RegistrationPeriodResponse>
   */
  getAllPeriods: async () => {
    return await axiosClient.get(ADMIN_PREFIX);
  },

  /**
   * Tạo một đợt đăng ký lưu trú mới
   * Backend: POST /api/v1/admin/registration-periods
   * @param {Object} data - CreateRegistrationPeriodRequest
   * @returns {Promise<ApiResponse>} RegistrationPeriodResponse
   */
  createPeriod: async (data) => {
    return await axiosClient.post(ADMIN_PREFIX, data);
  },

  /**
   * Cập nhật thông tin chi tiết của một đợt đăng ký cụ thể (Hỗ trợ cập nhật full để tái sử dụng)
   * Backend: PATCH /api/v1/admin/registration-periods/{id}
   * @param {string} id - UUID của đợt cần cập nhật
   * @param {Object} data - UpdateRegistrationPeriodRequest (Gồm name, registrationType, startDate, endDate)
   * @returns {Promise<ApiResponse>} RegistrationPeriodResponse
   */
  updatePeriod: async (id, data) => {
    return await axiosClient.patch(`${ADMIN_PREFIX}/${id}`, data);
  },

  /**
   * Kích hoạt đợt đăng ký hệ thống (Tự động tắt các đợt khác)
   * Backend: PATCH /api/v1/admin/registration-periods/{id}/activate
   * @param {string} id - UUID của đợt đăng ký
   * @returns {Promise<ApiResponse>} data: null
   */
  activatePeriod: async (id) => {
    return await axiosClient.patch(`${ADMIN_PREFIX}/${id}/activate`);
  },

  /**
   * Tạm dừng/Tắt đợt đăng ký đang hoạt động
   * Backend: PATCH /api/v1/admin/registration-periods/{id}/deactivate
   * @param {string} id - UUID của đợt đăng ký
   * @returns {Promise<ApiResponse>} data: null
   */
  deactivatePeriod: async (id) => {
    return await axiosClient.patch(`${ADMIN_PREFIX}/${id}/deactivate`);
  },

  // --- NHÓM DANH SÁCH HỢP LỆ (ELIGIBILITY) ---

  /**
   * Import danh sách sinh viên đủ điều kiện từ file Excel
   * Backend: POST /api/v1/admin/registration-periods/{periodId}/eligibilities/import
   * @param {string} periodId - UUID của đợt đăng ký
   * @param {File} file - Đối tượng File từ <input type="file" />
   * @returns {Promise<ApiResponse>} EligibilityImportResponse (total, imported, skipped)
   */
  importEligibility: async (periodId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return await axiosClient.post(`${ADMIN_PREFIX}/${periodId}/eligibilities/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Xem danh sách sinh viên đủ điều kiện của một đợt (ĐÃ CHUẨN HÓA PHÂN TRANG)
   * Backend: GET /api/v1/admin/registration-periods/{periodId}/eligibilities?page=...&size=...
   * @param {string} periodId - UUID của đợt đăng ký
   * @param {number} [page=0] - Số trang hiện tại (bắt đầu từ 0)
   * @param {number} [size=10] - Số lượng bản ghi trên một trang
   * @returns {Promise<ApiResponse>} Page<EligibilityResponse> (Mảng dữ liệu sẽ nằm trong data.content)
   */
  getEligibilities: async (periodId, page = 0, size = 10) => {
    return await axiosClient.get(`${ADMIN_PREFIX}/${periodId}/eligibilities`, {
      params: { page, size }
    });
  },

  /**
   * Xóa một sinh viên khỏi danh sách đủ điều kiện
   * Backend: DELETE /api/v1/admin/registration-periods/{periodId}/eligibilities/{eligibilityId}
   * @param {string} periodId - UUID của đợt đăng ký
   * @param {string} eligibilityId - UUID của bản ghi eligibility cần xóa
   * @returns {Promise<ApiResponse>} data: null
   */
  deleteEligibility: async (periodId, eligibilityId) => {
    return await axiosClient.delete(`${ADMIN_PREFIX}/${periodId}/eligibilities/${eligibilityId}`);
  },
};

// =========================================================================
// 2. PHÂN HỆ ĐĂNG KÝ CÔNG KHAI DÀNH CHO SINH VIÊN (Named Export)
// =========================================================================
export const studentRegistrationApi = {
  /**
   * Kiểm tra điều kiện tham gia đăng ký ký túc xá của sinh viên
   * Backend: POST /api/v1/registrations/check-eligibility
   * @param {Object} data - CheckEligibilityRequest
   * @param {string} data.cccd - Số Căn cước công dân của sinh viên
   * @returns {Promise<ApiResponse>} CheckEligibilityResponse (Gồm eligible, periodId, target, fullName, message...)
   */
  checkEligibility: async (data) => {
    return await axiosClient.post(`${STUDENT_PREFIX}/check-eligibility`, data);
  },
};