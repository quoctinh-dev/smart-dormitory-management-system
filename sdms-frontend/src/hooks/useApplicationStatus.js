import { useState, useCallback } from "react";
import { applicationApi, documentApi } from "@/api";

export const useApplicationStatus = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [application, setApplication] = useState(null);
    const [documents, setDocuments] = useState([]);

    const fetchStatus = useCallback(async (cccd, periodId) => {
        if (!cccd || !periodId) return;

        setLoading(true);
        setError(null);
        try {
            const appRes = await applicationApi.getStatus({ cccd, periodId });
            const appData = appRes.data || appRes;
            setApplication(appData);

            const docsData = await documentApi.getByApplication(appData.id);
            setDocuments(docsData || []);
        } catch (err) {
            // Tách biệt lỗi để UI có thể hiển thị thông báo phù hợp
            setError(err.response?.status === 404 ? 'Hồ sơ không tồn tại' : 'Đã xảy ra lỗi hệ thống');
            setApplication(null);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { application, documents, loading, error, fetchStatus };
};