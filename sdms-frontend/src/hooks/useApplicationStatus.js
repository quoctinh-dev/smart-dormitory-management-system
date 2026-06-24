// 📄 File: src/hooks/useApplicationStatus.js
import { useState, useCallback } from "react";
import applicationApi from "@/api/applicationApi";
import paymentApi from "@/api/paymentApi";

export const useApplicationStatus = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [application, setApplication] = useState(null);

    const fetchStatus = useCallback(async (cccd) => {
        if (!cccd) return;

        setLoading(true);
        setError(null);
        setApplication(null); 
        
        try {
            // 1. Lấy thông tin cơ bản của đơn đăng ký
            const appRes = await applicationApi.getStatus({ cccd });
            let appData = appRes.data || appRes;

            if (appData) {
                // 2. 🌟 GỌI API PUBLIC ROOM: Chủ động kéo phòng dự kiến về dựa trên applicationId
                try {
                    // Gọi trực tiếp đến url cấu hình của PublicRoomController
                    const roomRes = await axiosClient.get(`/v1/public/room/assignment/${appData.applicationId}`);
                    const roomData = roomRes.data || roomRes;
                    
                    // Gán ngược object phòng vào trường assignment để Component con (AssignmentInfo) tự bóc tách hiển thị
                    appData.assignment = roomData; 
                } catch (roomErr) {
                    // Nếu lỗi 404 (chưa gán phòng nháp) thì cho qua, assignment sẽ là null
                    console.log("Hồ sơ chưa được xếp phòng dự kiến:", roomErr.response?.data?.message || roomErr.message);
                }

                // 3. Nếu trạng thái là chờ đóng tiền, tiếp tục kéo Bill về (giữ nguyên luồng cũ)
                if (appData.status === 'WAITING_PAYMENT') {
                    try {
                        const billRes = await paymentApi.getBillByApplication(appData.applicationId);
                        appData.bill = billRes.data || billRes; 
                    } catch (billErr) {
                        console.warn("Chưa tìm thấy hóa đơn:", billErr);
                    }
                }
                
                setApplication(appData);
            }
        } catch (err) {
            setError(err.response?.status === 404 ? 'Hồ sơ không tồn tại' : 'Đã xảy ra lỗi hệ thống');
            setApplication(null);
        } finally {
            setLoading(false);
        }
    }, []);

    return { application, loading, error, fetchStatus };
};