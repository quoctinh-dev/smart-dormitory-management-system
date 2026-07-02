// @ts-nocheck
import axiosClient from './axiosClient';

const APP_URL = '/v1/applications';
const ADMIN_APP_URL = '/v1/admin/applications';
const UPLOADS_URL = '/v1/uploads';

const applicationApi = {
  create(data) {
    return axiosClient.post(APP_URL, data);
  },

  getById(id) {
    return axiosClient.get(`${APP_URL}/${id}`);
  },

  getAll(params) {
    return axiosClient.get(APP_URL, { params });
  },

  getStatus({ cccd }) {
    return axiosClient.get(`${APP_URL}/status`, { params: { cccd } });
  },

  // getAssignment method is removed as assignment info is now embedded in ApplicationResponse

  approve(id, note = 'Approved via Web') {
    return axiosClient.patch(`${ADMIN_APP_URL}/${id}/approve`, { note });
  },

  reject(id, note = 'Rejected via Web') {
    return axiosClient.patch(`${ADMIN_APP_URL}/${id}/reject`, { note });
  },

  requestRevision(id, note = 'Please review your documents', deadlineDays = 3) {
    return axiosClient.patch(`${ADMIN_APP_URL}/${id}/request-revision`, { note, deadlineDays });
  },

  confirmPayment(id, note = 'Đã thu tiền mặt') {
    return axiosClient.patch(`${ADMIN_APP_URL}/${id}/confirm-payment`, { note });
  },

  submit(id) {
    return axiosClient.post(`${APP_URL}/${id}/submit`);
  },

  uploadDocument(id, type, fileUrl) {
    return axiosClient.post(`${APP_URL}/${id}/documents`, null, {
      params: { type, fileUrl },
    });
  },

  resubmitDocument(applicationId, documentId, fileUrl) {
    return axiosClient.put(`${APP_URL}/${applicationId}/documents/${documentId}/resubmit`, null, {
      params: { fileUrl },
    });
  },

  verifyDocument(documentId, status, note) {
    return axiosClient.patch(`${ADMIN_APP_URL}/documents/${documentId}/verify`, { status, note });
  },

  uploadFileToCloud(formData) {
    return axiosClient.post(`${UPLOADS_URL}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default applicationApi;
