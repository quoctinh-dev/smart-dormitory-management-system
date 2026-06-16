import { useState, useEffect, useCallback } from "react";
import { applicationApi, periodApi, documentApi } from "@/api";

export const useRegistration = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [period, setPeriod] = useState(null);
    const [appId, setAppId] = useState(null);
    const [formData, setFormData] = useState({ cccd: '', fullName: '' });
    const [uploadedDocs, setUploadedDocs] = useState([]);

    useEffect(() => {
        const init = async () => {
            try {
                const data = await periodApi.getCurrent();
                setPeriod(data);
            } catch (err) {
                if (err.status !== 400) setError("Hệ thống tạm thời ngoại tuyến.");
            }
        };
        init();
    }, []);

    const handleNext = async () => {
        setError(null);
        if (activeStep === 1) {
            setLoading(true);
            try {
                const res = await applicationApi.create({ cccd: formData.cccd.trim(), periodId: period?.id });
                setAppId(res.id);
                setActiveStep(2);
            } catch (err) {
                setError(err.response?.data?.message || "Lỗi tạo hồ sơ.");
            } finally {
                setLoading(false);
            }
        } else if (activeStep === 2) {
            if (uploadedDocs.length === 0) return setError("Bắt buộc tải lên tài liệu.");
            setActiveStep(3);
        } else {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleUpload = async (type) => {
        setLoading(true);
        try {
            await documentApi.upload(appId, type, `path/to/file`);
            setUploadedDocs(prev => [...prev, type]);
        } catch (err) {
            setError("Lỗi upload.");
        } finally {
            setLoading(false);
        }
    };

    return { activeStep, loading, error, period, formData, setFormData, uploadedDocs, handleNext, handleUpload };
};