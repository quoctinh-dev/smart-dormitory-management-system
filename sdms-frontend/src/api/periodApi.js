import axiosClient from "./axiosClient";

const PERIOD_URL = "/v1/periods"; // Định nghĩa prefix URL

const periodApi = {
    getCurrent() {
        return axiosClient.get(`${PERIOD_URL}/current`);
    }
};

export default periodApi;