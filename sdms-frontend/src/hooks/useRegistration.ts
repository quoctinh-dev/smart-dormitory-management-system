import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { applicationApi, studentRegistrationApi, ocrApi } from '@/api';
import { snackbar } from '@/utils/snackbar';

interface IEligibilityResponse {
  eligible: boolean;
  periodId: string;
  periodName: string;
  registrationType: string;
  target?: string;
  fullName?: string;
  message?: string;
}

interface IApplicationCreateResponse {
  applicationId: string;
}

interface IOcrResponse {
  cccd?: string;
  fullName?: string;
  dob?: string;
  gender?: string;
  permanentAddress?: string;
  pob?: string;
  issueDate?: string;
  issuePlace?: string;
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
      const res = (await studentRegistrationApi.checkEligibility({
        email: cleanEmail,
        otp: cleanOtp,
      })) as unknown as IEligibilityResponse;

      if (res && res.eligible) {
        setPeriod({
          periodId: res.periodId,
          periodName: res.periodName,
          registrationType: res.registrationType,
        });
        setTargetGroup(res.target || 'ALL');
        setFormData((prev) => ({ ...prev, fullName: res.fullName || '' }));
        snackbar.success('Xác thực thành công! V vui lòng tiếp tục.');
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
      if (!uploadedDocs.CCCD_FRONT || !uploadedDocs.CCCD_BACK) {
        snackbar.warning('Vui lòng tải lên đầy đủ 2 mặt của Căn Cước Công Dân.');
        return setError('Vui lòng tải lên đầy đủ 2 mặt của Căn Cước Công Dân.');
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
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
        setActiveStep(3);
      } catch (err: any) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        snackbar.error(errorMsg);
      } finally {
        setLoading(false);
      }
    } else if (activeStep === 3) {
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
      setActiveStep(4);
    } else if (activeStep === 4) {
      if (!formData.isCommitted) {
        snackbar.warning('Vui lòng xác nhận đồng ý với các cam kết.');
        return setError('Vui lòng đọc và đánh dấu xác nhận đồng ý với các cam kết lưu trú.');
      }
      setLoading(true);
      try {
        await applicationApi.submit(appId!);
        snackbar.success('Chúc mừng! Bạn đã nộp hồ sơ thành công.');
        setActiveStep(5);
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

  const triggerOcr = async (frontUrl: string, backUrl: string) => {
    snackbar.info('Đang phân tích thông tin CCCD...');
    try {
      const res = (await ocrApi.extractCccd({
        frontImageUrl: frontUrl,
        backImageUrl: backUrl,
      })) as IOcrResponse;
      if (res) {
        setFormData((prev) => ({
          ...prev,
          cccd: res.cccd || prev.cccd,
          fullName: res.fullName || prev.fullName,
          dob: res.dob || prev.dob,
          gender: res.gender || prev.gender,
          permanentAddress: res.permanentAddress || prev.permanentAddress,
          pob: res.pob || prev.pob,
          issueDate: res.issueDate || prev.issueDate,
          issuePlace: res.issuePlace || prev.issuePlace,
        }));
        snackbar.success('Đã trích xuất thông tin CCCD thành công!');
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      snackbar.warning(errorMsg + ' Vui lòng kiểm tra lại ảnh hoặc nhập thông tin bằng tay để tiếp tục.');
    }
  };

  const handleScanUpload = async (type: string, file: File) => {
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

      if (
        newUrls.CCCD_FRONT &&
        newUrls.CCCD_BACK &&
        (type === 'CCCD_FRONT' || type === 'CCCD_BACK')
      ) {
        await triggerOcr(newUrls.CCCD_FRONT, newUrls.CCCD_BACK);
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      snackbar.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (type: string, file: File) => {
    setLoading(true);
    setError(null);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const uploadRes = (await applicationApi.uploadFileToCloud(uploadData)) as IUploadResponse;
      const fileUrl = uploadRes.url;

      await applicationApi.uploadDocument(appId!, type, fileUrl);

      setUploadedDocs((prev) => ({ ...prev, [type]: file.name }));
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
    handleNext,
    handleBack,
    handleUpload,
    handleScanUpload,
  };
};
