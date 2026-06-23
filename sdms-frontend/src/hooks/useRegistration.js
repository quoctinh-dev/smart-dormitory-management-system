import { useState } from "react";
import { applicationApi, periodApi } from "@/api";

export const useRegistration = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [period, setPeriod] = useState(null);
    const [appId, setAppId] = useState(null);
    const [formData, setFormData] = useState({ 
        cccd: '', fullName: '', dob: '', gender: 'MALE', email: '', phone: '',
        permanentAddress: '', contactAddress: '', priorityCategories: ['NONE'],
        issueDate: '', issuePlace: '', pob: '', ethnic: '', religion: '', faculty: '',
        fatherName: '', fatherYob: '', fatherJob: '', fatherPhone: '',
        motherName: '', motherYob: '', motherJob: '', motherPhone: '', familyContact: ''
    });
    const [uploadedDocs, setUploadedDocs] = useState({
        CCCD_FRONT: null,
        CCCD_BACK: null,
        PORTRAIT_PHOTO: null,
        COMMITMENT_FORM: null
    });

    const handleCheckEligibility = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await periodApi.checkEligibility({ cccd: formData.cccd.trim() });
            if (res.eligible) {
                setPeriod({
                    periodId: res.periodId,
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
            setLoading(true);
            try {
                // Call real API
                const payload = {
                    periodId: period.periodId,
                    fullName: formData.fullName,
                    dob: formData.dob,
                    gender: formData.gender,
                    cccd: formData.cccd,
                    email: formData.email,
                    phone: formData.phone,
                    permanentAddress: formData.permanentAddress,
                    contactAddress: formData.contactAddress,
                    issueDate: formData.issueDate || null,
                    issuePlace: formData.issuePlace,
                    pob: formData.pob,
                    ethnic: formData.ethnic,
                    religion: formData.religion,
                    faculty: formData.faculty,
                    fatherName: formData.fatherName,
                    fatherYob: formData.fatherYob ? parseInt(formData.fatherYob) : null,
                    fatherJob: formData.fatherJob,
                    fatherPhone: formData.fatherPhone,
                    motherName: formData.motherName,
                    motherYob: formData.motherYob ? parseInt(formData.motherYob) : null,
                    motherJob: formData.motherJob,
                    motherPhone: formData.motherPhone,
                    familyContact: formData.familyContact,
                    priorityCategories: formData.priorityCategories.includes("NONE") ? [] : formData.priorityCategories
                };
                const res = await applicationApi.create(payload);
                setAppId(res.applicationId);
                setActiveStep(2);
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Lỗi tạo hồ sơ.");
            } finally {
                setLoading(false);
            }
        } else if (activeStep === 2) {
            if (!uploadedDocs.CCCD_FRONT || !uploadedDocs.CCCD_BACK || !uploadedDocs.PORTRAIT_PHOTO) {
                return setError("Vui lòng tải lên đầy đủ 3 loại tài liệu bắt buộc chung (CCCD và Ảnh thẻ).");
            }
            const priorities = (formData.priorityCategories || []).filter(p => p !== 'NONE');
            for (let p of priorities) {
                const proofType = p + '_PROOF'; // e.g. PRIORITY_01_PROOF
                if (!uploadedDocs[proofType]) {
                    return setError(`Vui lòng tải lên minh chứng cho diện ưu tiên đã chọn.`);
                }
            }
            // Move to Commitment step
            setActiveStep(3);
        } else if (activeStep === 3) {
            if (!formData.isCommitted) {
                return setError("Vui lòng đọc và đánh dấu xác nhận đồng ý với các cam kết lưu trú.");
            }
            setLoading(true);
            try {
                await applicationApi.submit(appId);
                setActiveStep(4);
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Lỗi nộp hồ sơ.");
            } finally {
                setLoading(false);
            }
        } else {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        setError(null);
    };

    const handleUpload = async (type, file) => {
        setLoading(true);
        setError(null);
        try {
            // Bước 1: Upload file lên Cloudinary (thông qua UploadController của Backend)
            const formData = new FormData();
            formData.append("file", file);
            
            // Tái sử dụng axiosClient để gọi API upload chung
            const uploadRes = await applicationApi.uploadFileToCloud(formData);
            const fileUrl = uploadRes.url; 

            // Bước 2: Lưu URL vừa có được vào hồ sơ
            await applicationApi.uploadDocument(appId, type, fileUrl);
            
            setUploadedDocs(prev => ({ ...prev, [type]: file.name }));
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Lỗi upload.");
        } finally {
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
