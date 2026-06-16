import axiosClient from "./axiosClient";

const BASE_ADMIN_URL = "v1/admin/registration-periods";
const BASE_PUBLIC_URL = "v1/registrations";

const periodApi = {
    // Admin Endpoints
    getAll: () => axiosClient.get(`${BASE_ADMIN_URL}`),
    
    create: (data) => axiosClient.post(`${BASE_ADMIN_URL}`, data),
    
    update: (id, data) => axiosClient.patch(`${BASE_ADMIN_URL}/${id}`, data),
    
    activate: (id) => axiosClient.patch(`${BASE_ADMIN_URL}/${id}/activate`),
    
    deactivate: (id) => axiosClient.patch(`${BASE_ADMIN_URL}/${id}/deactivate`),
    
    importEligibility: (periodId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post(`${BASE_ADMIN_URL}/${periodId}/eligibilities/import`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    getEligibilities: (periodId) => axiosClient.get(`${BASE_ADMIN_URL}/${periodId}/eligibilities`),

    deleteEligibility: (periodId, eligibilityId) => 
        axiosClient.delete(`${BASE_ADMIN_URL}/${periodId}/eligibilities/${eligibilityId}`),

    // Public Endpoints
    checkEligibility: (data) => axiosClient.post(`${BASE_PUBLIC_URL}/check-eligibility`, data),
};

export default periodApi;