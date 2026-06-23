import { useState, useEffect, useCallback } from "react";
import { periodApi } from "@/api";

export const useRegistrationPeriods = () => {
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // 1. Fetch dữ liệu - Đã sửa lỗi bóc tách dữ liệu thừa
    const fetchPeriods = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Lưu ý: Nếu axiosClient của bạn đã bóc .data ở Interceptor, 
            // thì kết quả trả về đây chính là mảng data.
            const data = await periodApi.getAll();
            setPeriods(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || "Lỗi khi tải danh sách đợt đăng ký");
        } finally {
            setLoading(false);
        }
    }, []);

    // Load data khi component mount
    useEffect(() => {
        fetchPeriods();
    }, [fetchPeriods]);

    // 2. Hàm dùng chung để xử lý mọi API (Create, Update, Activate, Deactivate)
    const handleApiAction = async (apiCall) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await apiCall();
            await fetchPeriods(); // Refresh lại danh sách sau khi thay đổi
            return { success: true };
        } catch (err) {
            // Lấy message lỗi chi tiết từ backend (nếu có)
            const message = err?.message || "Có lỗi xảy ra, vui lòng thử lại";
            return { success: false, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. Các hàm thao tác
    const handleCreate = (data) => handleApiAction(() => periodApi.create(data));
    
    const handleUpdate = (id, data) => handleApiAction(() => periodApi.update(id, data));
    
    const handleActivate = (id) => handleApiAction(() => periodApi.activate(id));
    
    const handleDeactivate = (id) => handleApiAction(() => periodApi.deactivate(id));

    return {
        periods,
        loading,
        isSubmitting,
        error,
        handleCreate,
        handleUpdate,
        handleActivate,
        handleDeactivate,
        refresh: fetchPeriods
    };
};