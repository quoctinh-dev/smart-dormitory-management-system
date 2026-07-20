import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { applicationApi, studentRegistrationApi } from '@/api';
import { snackbar } from '@/helpers/snackbar';


interface IApplicationCreateResponse {
  applicationId: string;
}

interface IUploadResponse {
  url: string;
}

export interface IRegistrationFormData {
  cccd: string;
  fullName: string;
  studentCode: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  permanentAddress: string;
  contactAddress: string;
  priorityCategories: string[];
  issueDate: string;
  issuePlace: string;
  pob: string;
  ethnic: string;
  religion: string;
  faculty: string;
  fatherName: string;
  fatherYob: string;
  fatherJob: string;
  fatherPhone: string;
  motherName: string;
  motherYob: string;
  motherJob: string;
  motherPhone: string;
  isCommitted: boolean;
  cohort: string;
  [key: string]: string | boolean | string[] | number | null; // Thay thế any bằng union type
}

export const useRegistration = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<{
    periodId: string;
    periodName: string;
    registrationType: string;
  } | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [targetGroup, setTargetGroup] = useState<string>('ALL');

  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');

  const location = useLocation();
  const initialEmail = (location.state as { email?: string } | null)?.email || '';

  const [formData, setFormData] = useState<IRegistrationFormData>({
    cccd: '',
    fullName: '',
    studentCode: '',
    dob: '',
    gender: 'MALE',
    email: initialEmail,
    phone: '',
    permanentAddress: '',
    contactAddress: '',
    priorityCategories: ['NONE'],
    issueDate: '',
    issuePlace: '',
    pob: '',
    ethnic: 'Kinh',
    religion: 'Không',
    faculty: '',
    fatherName: '',
    fatherYob: '',
    fatherJob: '',
    fatherPhone: '',
    motherName: '',
    motherYob: '',
    motherJob: '',
    motherPhone: '',
    cohort: '',
    isCommitted: false,
  });

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string | null>>({
    CCCD_FRONT: null,
    CCCD_BACK: null,
    PORTRAIT_PHOTO: null,
    COMMITMENT_FORM: null,
  });

  const [docUrls, setDocUrls] = useState<Record<string, string>>({});
  const [uploadedPreviews, setUploadedPreviews] = useState<Record<string, string>>({});

  // Hàm helper để trích xuất câu lỗi từ đối tượng error kiểu unknown
  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object' && 'message' in err) {
      return String((err as { message: unknown }).message);
    }
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as { response: unknown }).response;
      if (response && typeof response === 'object' && 'data' in response) {
        const data = (response as { data: unknown }).data;
        if (data && typeof data === 'object' && 'message' in data) {
          return String((data as { message: unknown }).message);
        }
      }
    }
    return typeof err === 'string' ? err : 'Có lỗi xảy ra, vui lòng thử lại.';
  };

  const handleRequestOtp = async () => {
    const cleanEmail = formData.email.trim();
    if (!cleanEmail) {
      setError('Vui lòng nhập Email để nhận mã OTP.');
      return;
    }

    // Kiểm tra định dạng Email trường STU
    if (!cleanEmail.toLowerCase().endsWith('@student.stu.edu.vn')) {
      setError('Hệ thống chỉ chấp nhận Email nội bộ của trường (@student.stu.edu.vn).');
      snackbar.error('Sai định dạng Email trường.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await studentRegistrationApi.requestOtp({ email: cleanEmail });
      setOtpSent(true);
      snackbar.success('Mã OTP đã được gửi đến email của bạn!');
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      snackbar.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEligibility = async () => {
    const cleanEmail = formData.email.trim();
    const cleanOtp = otpCode.trim();

    if (!cleanEmail || !cleanOtp) {
      setError('Vui lòng nhập đầy đủ Email và mã OTP.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await studentRegistrationApi.checkEligibility({
        email: cleanEmail,
        otp: cleanOtp,
      });

      if (res && res.eligible) {
        setPeriod({
          periodId: res.periodId ?? '',
          periodName: res.periodName ?? '',
          registrationType: res.registrationType ?? '',
        });
        setTargetGroup(res.target || 'ALL');
        setFormData((prev) => ({
          ...prev,
          fullName: res.fullName || prev.fullName,
          cccd: res.cccd || prev.cccd,
          studentCode: res.studentCode || prev.studentCode,
        }));
        snackbar.success('Xác thực thành công! Vui lòng tiếp tục.');
        setActiveStep(1);
      } else {
        const errorMsg = res?.message || 'Bạn không đủ điều kiện tham gia đợt đăng ký này.';
        setError(errorMsg);
        snackbar.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      snackbar.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const validateInfoSection = () => {
    const requiredFields: Record<string, string> = {
      fullName: 'Họ và tên',
      studentCode: 'Mã số sinh viên',
      cccd: 'Mã số định danh (CCCD)',
      dob: 'Ngày sinh',
      email: 'Email',
      phone: 'Số điện thoại sinh viên',
      permanentAddress: 'Địa chỉ thường trú',
      faculty: 'Khoa/Ngành học',
    };

    if (formData.cccd && formData.cccd.trim().length !== 12) {
      setError('Mã số định danh (CCCD) phải bao gồm đúng 12 chữ số.');
      snackbar.warning('Mã số định danh chưa hợp lệ.');
      return false;
    }

    const stuCodeRegex = /^[A-Za-z]{2}\d{8}$/;
    if (formData.studentCode && !stuCodeRegex.test(formData.studentCode.trim())) {
      setError('Mã số sinh viên không đúng định dạng của trường (VD: DH52201580).');
      snackbar.warning('Mã số sinh viên chưa hợp lệ.');
      return false;
    }

    if (
      formData.studentCode &&
      formData.email &&
      !formData.email.toLowerCase().startsWith(formData.studentCode.trim().toLowerCase())
    ) {
      setError('Mã số sinh viên không khớp với Email trường học đã nhập.');
      snackbar.warning('Mã số sinh viên không khớp với Email.');
      return false;
    }

    for (const [key, label] of Object.entries(requiredFields)) {
      const value = formData[key];
      if (typeof value !== 'string' || !value.trim()) {
        setError(`Vui lòng điền đầy đủ trường bắt buộc: ${label}.`);
        snackbar.warning(`Thiếu thông tin: ${label}`);
        return false;
      }
    }

    if (formData.fatherYob && isNaN(Number(formData.fatherYob))) {
      setError('Năm sinh của Cha phải là một dãy số hợp lệ.');
      snackbar.warning('Năm sinh của Cha không hợp lệ.');
      return false;
    }
    if (formData.motherYob && isNaN(Number(formData.motherYob))) {
      setError('Năm sinh của Mẹ phải là một dãy số hợp lệ.');
      snackbar.warning('Năm sinh của Mẹ không hợp lệ.');
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    setError(null);

    if (activeStep === 0) {
      await handleCheckEligibility();
    } else if (activeStep === 1) {
      if (!validateInfoSection()) return;

      setLoading(true);
      try {
        const payload = {
          periodId: period?.periodId || '',
          fullName: formData.fullName.trim(),
          studentCode: formData.studentCode.trim(),
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
          fatherYob: formData.fatherYob ? parseInt(String(formData.fatherYob), 10) : null,
          fatherJob: formData.fatherJob.trim(),
          fatherPhone: formData.fatherPhone.trim(),
          motherName: formData.motherName.trim(),
          motherYob: formData.motherYob ? parseInt(String(formData.motherYob), 10) : null,
          motherJob: formData.motherJob.trim(),
          motherPhone: formData.motherPhone.trim(),
          cohort: formData.cohort.trim(),
          priorityCategories: formData.priorityCategories.includes('NONE')
            ? []
            : formData.priorityCategories,
        };

        const res = (await applicationApi.create(payload)) as IApplicationCreateResponse;
        setAppId(res.applicationId);

        for (const [docType, url] of Object.entries(docUrls)) {
          await applicationApi.uploadDocument(res.applicationId, docType, url);
        }

        snackbar.success('Đã lưu thông tin hồ sơ thành công!');
        setActiveStep(2);
      } catch (err: any) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        snackbar.error(errorMsg);
      } finally {
        setLoading(false);
      }
    } else if (activeStep === 2) {
      if (!uploadedDocs.CCCD_FRONT || !uploadedDocs.CCCD_BACK) {
        snackbar.warning('Vui lòng tải lên đầy đủ 2 mặt của Căn Cước Công Dân.');
        return setError('Vui lòng tải lên đầy đủ 2 mặt của Căn Cước Công Dân.');
      }
      if (!uploadedDocs.PORTRAIT_PHOTO) {
        snackbar.warning('Vui lòng tải lên Ảnh thẻ 3x4.');
        return setError('Vui lòng tải lên Ảnh thẻ 3x4.');
      }

      const priorities = (formData.priorityCategories || []).filter((p) => p !== 'NONE');
      for (const p of priorities) {
        const proofType = `${p}_PROOF`;
        if (!uploadedDocs[proofType]) {
          snackbar.warning(`Vui lòng tải lên minh chứng cho diện ưu tiên [${p}].`);
          return setError(`Vui lòng tải lên minh chứng cho diện ưu tiên [${p}] đã chọn.`);
        }
      }
      setActiveStep(3);
    } else if (activeStep === 3) {
      if (!formData.isCommitted) {
        snackbar.warning('Vui lòng xác nhận đồng ý với các cam kết.');
        return setError('Vui lòng đọc và đánh dấu xác nhận đồng ý với các cam kết lưu trú.');
      }
      setLoading(true);
      try {
        await applicationApi.submit(appId!);
        snackbar.success('Chúc mừng! Bạn đã nộp hồ sơ thành công.');
        setActiveStep(4);
      } catch (err: any) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        snackbar.error(errorMsg);
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleScanUpload = async (type: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'Kích thước file không được vượt quá 5MB.';
      setError(errorMsg);
      snackbar.error(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const uploadRes = (await applicationApi.uploadFileToCloud(uploadData)) as IUploadResponse;
      const fileUrl = uploadRes.url;

      setUploadedDocs((prev) => ({ ...prev, [type]: file.name }));

      const newUrls = { ...docUrls, [type]: fileUrl };
      setDocUrls(newUrls);
      setUploadedPreviews((prev) => ({ ...prev, [type]: fileUrl }));
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      snackbar.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (type: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'Kích thước file không được vượt quá 5MB.';
      setError(errorMsg);
      snackbar.error(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const uploadRes = (await applicationApi.uploadFileToCloud(uploadData)) as IUploadResponse;
      const fileUrl = uploadRes.url;

      await applicationApi.uploadDocument(appId!, type, fileUrl);

      setUploadedDocs((prev) => ({ ...prev, [type]: file.name }));
      setUploadedPreviews((prev) => ({ ...prev, [type]: fileUrl }));
      snackbar.success(`Tải lên ${file.name} thành công!`);
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      snackbar.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    otpSent,
    otpCode,
    setOtpCode,
    handleRequestOtp,
    activeStep,
    loading,
    error,
    period,
    targetGroup,
    formData,
    setFormData,
    uploadedDocs,
    uploadedPreviews,
    handleNext,
    handleBack,
    handleUpload,
    handleScanUpload,
  };
};
