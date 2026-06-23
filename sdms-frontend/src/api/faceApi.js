import axiosClient from "./axiosClient";

const ADMIN_FACE_URL = "/v1/admin/faces";
const STUDENT_FACE_URL = "/v1/students/me/face";

const faceApi = {
    // ADMIN ENDPOINTS
    getPendingProfiles(params) {
        return axiosClient.get(`${ADMIN_FACE_URL}/pending`, { params });
    },
    approveFace(profileId, adminId) {
        return axiosClient.post(`${ADMIN_FACE_URL}/${profileId}/approve`, null, {
            headers: { 'X-Admin-Id': adminId }
        });
    },
    rejectFace(profileId, reason) {
        return axiosClient.post(`${ADMIN_FACE_URL}/${profileId}/reject`, { rejectionReason: reason });
    },
    
    // STUDENT ENDPOINTS
    registerFace(studentId, faceImageUrl) {
        return axiosClient.post(`${STUDENT_FACE_URL}`, { faceImageUrl }, {
            headers: { 'X-Student-Id': studentId }
        });
    },
    getMyFaceProfile(studentId) {
        return axiosClient.get(`${STUDENT_FACE_URL}`, {
            headers: { 'X-Student-Id': studentId }
        });
    }
};

export default faceApi;
