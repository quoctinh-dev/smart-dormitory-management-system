// @ts-nocheck
import axiosClient from './axiosClient';

const DOC_URL = '/v1/documents';

const documentApi = {
  /**
   * Tải tài liệu minh chứng lên hệ thống (CCCD, Ảnh 3x4, Giấy ưu tiên...)
   * @param {string|number} appId - ID của hồ sơ đăng ký
   * @param {string} type - Loại tài liệu (ví dụ: 'CCCD_FRONT', 'PROFILE_3X4')
   * @param {File} file - Đối tượng file thực tế từ input
   */
  upload(appId, type, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return axiosClient.post(`${DOC_URL}/upload/${appId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default documentApi;
