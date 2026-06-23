import axiosClient from "./axiosClient";

const ADMIN_ROOM_API = "/v1/admin/buildings";
const DASHBOARD_API = "/v1/admin/dashboard/room";

const roomApi = {
    // ---- DASHBOARD ----
    getOverview() {
        return axiosClient.get(`${DASHBOARD_API}`);
    },
    getBedStats() {
        return axiosClient.get(`${DASHBOARD_API}/beds`);
    },

    // ---- BUILDINGS ----
    getAllBuildings() {
        return axiosClient.get(ADMIN_ROOM_API);
    },
    getBuildingDetail(id) {
        return axiosClient.get(`${ADMIN_ROOM_API}/${id}`);
    }
};

export default roomApi;
