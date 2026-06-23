import axiosClient from "./axiosClient";

const APP_URL = "/v1/applications";
const ADMIN_APP_URL = "/v1/admin/applications";

const applicationApi = {
    create(data) {
        return axiosClient.post(`${APP_URL}`, data);
    },
    getById(id) {
        return axiosClient.get(`${APP_URL}/${id}`);
    },
    getAll(params) {
        return axiosClient.get(`${APP_URL}`, { params });
    },
    getStatus({ cccd }) {
        return axiosClient.get(`${APP_URL}/status`, { params: { cccd } });
    },
    getAssignment(applicationId) {
        return axiosClient.get(`/v1/public/room/assignment/${applicationId}`);
    },
    approve(id, note = "Approved via Web") {
        return axiosClient.patch(`${ADMIN_APP_URL}/${id}/approve`, { note });
    },
    reject(id, note = "Rejected via Web") {
        return axiosClient.patch(`${ADMIN_APP_URL}/${id}/reject`, { note });
    },
    requestRevision(id, note = "Please review your documents", deadlineDays = 3) {
        return axiosClient.patch(`${ADMIN_APP_URL}/${id}/request-revision`, { note, deadlineDays });
    },
    submit(id) {
        return axiosClient.post(`${APP_URL}/${id}/submit`);
    },
    uploadDocument(id, type, fileUrl) {
        return axiosClient.post(`${APP_URL}/${id}/documents?type=${type}&fileUrl=${encodeURIComponent(fileUrl)}`);
    },
    resubmitDocument(applicationId, documentId, fileUrl) {
        return axiosClient.put(`${APP_URL}/${applicationId}/documents/${documentId}/resubmit?fileUrl=${encodeURIComponent(fileUrl)}`);
    },
    verifyDocument(documentId, status, note) {
        return axiosClient.patch(`${ADMIN_APP_URL}/documents/${documentId}/verify`, { status, note });
    },
    uploadFileToCloud(formData) {
        return axiosClient.post("/v1/uploads/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    }
};

export default applicationApi;