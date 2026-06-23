import { useState, useCallback } from "react";
import applicationApi from "@/api/applicationApi";

export const useApplicationStatus = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [application, setApplication] = useState(null);
    const [assignment, setAssignment] = useState(null);
    const [documents, setDocuments] = useState([]);

    const fetchStatus = useCallback(async (cccd) => {
        if (!cccd) return;

        setLoading(true);
        setError(null);
        try {
            const appRes = await applicationApi.getStatus({ cccd });
            const appData = appRes.data || appRes;
            setApplication(appData);
            setDocuments(appData.documents || []);

            // Fetch room assignment if available
            try {
                const roomRes = await applicationApi.getAssignment(appData.applicationId);
                setAssignment(roomRes.data || roomRes);
            } catch {
                setAssignment(null);
            }
        } catch (err) {
            // Tách biệt lỗi để UI có thể hiển thị thông báo phù hợp
            setError(err.response?.status === 404 ? 'Hồ sơ không tồn tại' : 'Đã xảy ra lỗi hệ thống');
            setApplication(null);
            setAssignment(null);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { application, assignment, documents, loading, error, fetchStatus };
};