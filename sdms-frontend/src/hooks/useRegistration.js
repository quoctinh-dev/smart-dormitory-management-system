import { useState } from "react";
import { applicationApi, periodApi, documentApi } from "@/api";

export const useRegistration = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [period, setPeriod] = useState(null);
    const [appId, setAppId] = useState(null);
    const [formData, setFormData] = useState({ cccd: '', fullName: '' });
    const [uploadedDocs, setUploadedDocs] = useState([]);

    const handleCheckEligibility = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await periodApi.checkEligibility({ cccd: formData.cccd.trim() });
            if (res.eligible) {
                setPeriod({
                    periodName: res.periodName,
                    registrationType: res.registrationType,
                });
                setFormData(prev => ({ ...prev, fullName: res.fullName || '' }));
                setActiveStep(1); // Proceed to Info step
            } else {
                setError(res.message || "Bạn không đủ điều kiện tham gia đợt đăng ký này.");
            }
        } catch (err) {
            setError(err.message || "Lỗi kiểm tra điều kiện.");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        setError(null);
        if (activeStep === 0) {
            await handleCheckEligibility();
        } else if (activeStep === 1) {
            // Assume we create application here
            setLoading(true);
            try {
                // Mock API call since applicationApi is incomplete
                // const res = await applicationApi.create({ cccd: formData.cccd.trim() });
                // setAppId(res.id);
                setTimeout(() => {
                    setAppId("dummy-app-id");
                    setActiveStep(2);
                    setLoading(false);
                }, 1000);
            } catch (err) {
                setError(err.message || "Lỗi tạo hồ sơ.");
                setLoading(false);
            }
        } else if (activeStep === 2) {
            if (uploadedDocs.length === 0) return setError("Bắt buộc tải ít nhất một tài liệu.");
            setActiveStep(3);
        } else {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        setError(null);
    };

    const handleUpload = async (file) => {
        setLoading(true);
        setError(null);
        try {
            // Mock upload
            // await documentApi.upload(appId, type, file);
            setTimeout(() => {
                setUploadedDocs(prev => [...prev, file.name]);
                setLoading(false);
            }, 1000);
        } catch (err) {
            setError("Lỗi upload.");
            setLoading(false);
        }
    };

    return { 
        activeStep, 
        loading, 
        error, 
        period, 
        formData, 
        setFormData, 
        uploadedDocs, 
        handleNext, 
        handleBack,
        handleUpload 
    };
};
