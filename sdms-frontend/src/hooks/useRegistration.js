import { useState } from 'react';
// CHUẨN HÓA TẠI ĐÂY: Trỏ thẳng về cổng tổng @/api để lấy đúng các Named Export
import { applicationApi, studentRegistrationApi } from '@/api';

export const useRegistration = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [period, setPeriod] = useState(null);
  const [appId, setAppId] = useState(null);
  
  // Lưu phân loại đối tượng (FRESHMAN, CURRENT_STUDENT, ALL) để UI ẩn/hiện bớt các trường thông tin phù hợp
  const [targetGroup, setTargetGroup] = useState('ALL'); 
  
  const [formData, setFormData] = useState({ 
    cccd: '', fullName: '', dob: '', gender: 'MALE', email: '', phone: '',
    permanentAddress: '', contactAddress: '', priorityCategories: ['NONE'],
    issueDate: '', issuePlace: '', pob: '', ethnic: '', religion: '', faculty: '',
    fatherName: '', fatherYob: '', fatherJob: '', fatherPhone: '',
    motherName: '', motherYob: '', motherJob: '', motherPhone: '', familyContact: '',
    isCommitted: false // Quản lý trạng thái check cam kết ở Step 3
  });

  const [uploadedDocs, setUploadedDocs] = useState({
    CCCD_FRONT: null,
    CCCD_BACK: null,
    PORTRAIT_PHOTO: null,
    COMMITMENT_FORM: null
  });

  // ==========================================
  // BƯỚC 0: KIỂM TRA ĐIỀU KIỆN ĐĂNG KÝ (CCCD)
  // ==========================================
  const handleCheckEligibility = async () => {
    const cleanCccd = formData.cccd.trim();
    if (!cleanCccd) return setError("Vui lòng nhập số CCCD/CMND để kiểm tra.");

    setLoading(true);
    setError(null);
    try {
      // axiosClient đã tự động bóc vỏ (.data.data), res ở đây chính là CheckEligibilityResponse từ Backend
      const res = await studentRegistrationApi.checkEligibility({ cccd: cleanCccd });
      
      if (res && res.eligible) {
        setPeriod({
          periodId: res.periodId,
          periodName: res.periodName,
          registrationType: res.registrationType,
        });

        // Lưu nhóm đối tượng trả về từ danh sách Excel (Tân sinh viên hay Cư dân cũ)
        setTargetGroup(res.target || 'ALL');
        
        // Tự động điền sẵn Họ tên được trích xuất từ DB do Admin import trước đó
        setFormData(prev => ({ ...prev, fullName: res.fullName || '' }));
        setActiveStep(1); 
      } else {
        setError(res?.message || "Bạn không đủ điều kiện tham gia đợt đăng ký này.");
      }
    } catch (err) {
      // Đọc thông báo lỗi nghiệp vụ dạng chuỗi text hoặc cấu hình từ axiosClient ném về
      setError(err.message || err || "Lỗi kiểm tra điều kiện đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGIC VALIDATE THÔNG TIN FORM (BƯỚC 1)
  // ==========================================
  const validateInfoSection = () => {
    const requiredFields = {
      fullName: "Họ và tên",
      dob: "Ngày sinh",
      email: "Email",
      phone: "Số điện thoại sinh viên",
      permanentAddress: "Địa chỉ thường trú",
      faculty: "Khoa/Ngành học"
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!formData[key]?.trim()) {
        setError(`Vui lòng điền đầy đủ trường bắt buộc: ${label}.`);
        return false;
      }
    }

    if (formData.fatherYob && isNaN(Number(formData.fatherYob))) {
      setError("Năm sinh của Cha phải là một dãy số hợp lệ.");
      return false;
    }
    if (formData.motherYob && isNaN(Number(formData.motherYob))) {
      setError("Năm sinh của Mẹ phải là một dãy số hợp lệ.");
      return false;
    }

    return true;
  };

  // ==========================================
  // ĐIỀU KHIỂN LUỒNG FORM (NEXT STEP)
  // ==========================================
  const handleNext = async () => {
    setError(null);

    // STEP 0 -> STEP 1: Check điều kiện mở đợt
    if (activeStep === 0) {
      await handleCheckEligibility();
    } 
    
    // STEP 1 -> STEP 2: Điền form thông tin cá nhân & Tạo hồ sơ nháp
    else if (activeStep === 1) {
      if (!validateInfoSection()) return; 

      setLoading(true);
      try {
        const payload = {
          periodId: period.periodId,
          fullName: formData.fullName.trim(),
          dob: formData.dob,
          gender: formData.gender,
          cccd: formData.cccd.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          permanentAddress: formData.permanentAddress.trim(),
          contactAddress: formData.contactAddress.trim(),
          issueDate: formData.issueDate || null,
          issuePlace: formData.issuePlace.trim(),
          pob: formData.pob.trim(),
          ethnic: formData.ethnic.trim(),
          religion: formData.religion.trim(),
          faculty: formData.faculty,
          fatherName: formData.fatherName.trim(),
          fatherYob: formData.fatherYob ? parseInt(formData.fatherYob, 10) : null,
          fatherJob: formData.fatherJob.trim(),
          fatherPhone: formData.fatherPhone.trim(),
          motherName: formData.motherName.trim(),
          motherYob: formData.motherYob ? parseInt(formData.motherYob, 10) : null,
          motherJob: formData.motherJob.trim(),
          motherPhone: formData.motherPhone.trim(),
          familyContact: formData.familyContact.trim(),
          priorityCategories: formData.priorityCategories.includes("NONE") ? [] : formData.priorityCategories
        };

        const res = await applicationApi.create(payload);
        setAppId(res.applicationId); // Lưu ID đơn hàng do Backend sinh ra để phục vụ upload tài liệu ở bước sau
        setActiveStep(2);
      } catch (err) {
        setError(err.message || err || "Lỗi tạo hồ sơ dữ liệu.");
      } finally {
        setLoading(false);
      }
    } 
    
    // STEP 2 -> STEP 3: Kiểm tra tệp tin minh chứng tải lên
    else if (activeStep === 2) {
      if (!uploadedDocs.CCCD_FRONT || !uploadedDocs.CCCD_BACK || !uploadedDocs.PORTRAIT_PHOTO) {
        return setError("Vui lòng tải lên đầy đủ 3 loại tài liệu bắt buộc chung (CCCD và Ảnh thẻ).");
      }
      
      const priorities = (formData.priorityCategories || []).filter(p => p !== 'NONE');
      for (let p of priorities) {
        const proofType = `${p}_PROOF`;
        if (!uploadedDocs[proofType]) {
          return setError(`Vui lòng tải lên minh chứng cho diện ưu tiên [${p}] đã chọn.`);
        }
      }
      setActiveStep(3);
    } 
    
    // STEP 3 -> STEP 4: Đọc cam kết & Xác nhận nộp đơn chính thức
    else if (activeStep === 3) {
      if (!formData.isCommitted) {
        return setError("Vui lòng đọc và đánh dấu xác nhận đồng ý với các cam kết lưu trú.");
      }
      setLoading(true);
      try {
        await applicationApi.submit(appId);
        setActiveStep(4); // Hoàn thành toàn bộ quy trình nộp đơn
      } catch (err) {
        setError(err.message || err || "Lỗi xác nhận nộp hồ sơ.");
      } finally {
        setLoading(false);
      }
    } 
    
    else {
      setActiveStep(prev => prev + 1);
    }
  };

  // Quay lại bước trước đó trên Giao diện
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError(null);
  };

  // ==========================================
  // XỬ LÝ TẢI LÊN MINH CHỨNG (UPLOAD FILE)
  // ==========================================
  const handleUpload = async (type, file) => {
    setLoading(true);
    setError(null);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      
      // Đẩy file lên Cloud Storage (S3 / Cloudinary / Firebase...)
      const uploadRes = await applicationApi.uploadFileToCloud(uploadData);
      const fileUrl = uploadRes.url; 

      // Ghi nhận liên kết URL của tệp tin vào hồ sơ đơn đăng ký dưới Database
      await applicationApi.uploadDocument(appId, type, fileUrl);
      
      // Cập nhật tên file lên UI để hiển thị trạng thái đã upload thành công
      setUploadedDocs(prev => ({ ...prev, [type]: file.name }));
    } catch (err) {
      setError(err.message || err || "Lỗi xử lý tệp tin tải lên.");
    } finally {
      setLoading(false);
    }
  };

  return { 
    activeStep, loading, error, period, targetGroup, formData, setFormData, 
    uploadedDocs, handleNext, handleBack, handleUpload 
  };
};