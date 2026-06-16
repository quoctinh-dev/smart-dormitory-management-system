import axiosClient from "./axiosClient";

const APP_URL = "/v1/applications";

const applicationApi = {
    create(data) {
        return axiosClient.post(`${APP_URL}`, data);
    },
    getById(id) {
        return axiosClient.get(`${APP_URL}/${id}`);
    }
};

export default applicationApi;