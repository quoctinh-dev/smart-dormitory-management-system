import axiosClient from "./axiosClient";

const DOC_URL = "/v1/documents";

const documentApi = {
    upload(appId, type, file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        return axiosClient.post(`${DOC_URL}/upload/${appId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    }
};

export default documentApi;