import { useState, useEffect, useCallback } from 'react';

// CHUẨN HÓA TẠI ĐÂY: Gọi đúng phân hệ adminRegistrationApi từ cổng tổng tập trung @/api
import { adminRegistrationApi } from '@/api';

export interface IRegistrationPeriod {
  periodId: string;
  periodName: string;
  registrationType: string;
  startDate: string;
  endDate: string;
  stayStartDate?: string;
  stayEndDate?: string;
  isActive: boolean;
  [key: string]: any;
}

const INITIAL_FORM_STATE = {
  periodName: '',
  registrationType: 'OPEN_REGISTRATION',
  startDate: '',
  endDate: '',
  stayStartDate: '',
  stayEndDate: '',
};

export function useRegistrationManagerUi() {
  const [periods, setPeriods] = useState<IRegistrationPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPeriodId, setCurrentPeriodId] = useState<string | null>(null);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [selectedPeriodForEligibility, setSelectedPeriodForEligibility] =
    useState<IRegistrationPeriod | null>(null);
  const [activationConfirmOpen, setActivationConfirmOpen] = useState(false);
  const [activationTargetId, setActivationTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  // Tải danh sách đợt (Khớp với cơ chế unwrap data của axiosClient)
  const fetchPeriods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminRegistrationApi.getAllPeriods();
      const data = (res as any)?.data || res;
      setPeriods((data as IRegistrationPeriod[]) || []);
    } catch (err: any) {
      setError(err.message || err || 'Lỗi hệ thống khi kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const showSnackbar = useCallback(
    (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const handleFormChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  const handleOpenCreate = useCallback(() => {
    setEditMode(false);
    setCurrentPeriodId(null);
    setFormData(INITIAL_FORM_STATE);
    setOpenDialog(true);
  }, []);

  const handleOpenEdit = useCallback(
    (period: IRegistrationPeriod) => () => {
      setEditMode(true);
      setCurrentPeriodId(period.periodId);
      setFormData({
        periodName: period.periodName,
        registrationType: period.registrationType,
        startDate: period.startDate ? new Date(period.startDate).toISOString().slice(0, 16) : '',
        endDate: period.endDate ? new Date(period.endDate).toISOString().slice(0, 16) : '',
        stayStartDate: period.stayStartDate
          ? new Date(period.stayStartDate).toISOString().slice(0, 10)
          : '',
        stayEndDate: period.stayEndDate
          ? new Date(period.stayEndDate).toISOString().slice(0, 10)
          : '',
      });
      setOpenDialog(true);
    },
    []
  );

  const handleOpenEligibility = useCallback(
    (period: IRegistrationPeriod) => () => {
      setSelectedPeriodForEligibility(period);
      setEligibilityDialogOpen(true);
    },
    []
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setCurrentPeriodId(null);
  }, []);

  const handleCloseEligibility = useCallback(() => {
    setEligibilityDialogOpen(false);
    setSelectedPeriodForEligibility(null);
  }, []);

  const handleCloseActivationConfirm = useCallback(() => {
    setActivationConfirmOpen(false);
    setActivationTargetId(null);
  }, []);

  const handleConfirmActivation = useCallback(async () => {
    if (!activationTargetId) return;

    try {
      setIsSubmitting(true);
      await adminRegistrationApi.activatePeriod(activationTargetId);
      showSnackbar('Kích hoạt đợt đăng ký thành công!', 'success');
      fetchPeriods();
    } catch (err: any) {
      showSnackbar(err.message || err || 'Cập nhật trạng thái thất bại.', 'error');
    } finally {
      setIsSubmitting(false);
      handleCloseActivationConfirm();
    }
  }, [activationTargetId, fetchPeriods, handleCloseActivationConfirm, showSnackbar]);

  // Xử lý tạo mới / cập nhật đợt
  const handleSubmitPeriod = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        stayStartDate: formData.stayStartDate ? `${formData.stayStartDate}T00:00:00` : null,
        stayEndDate: formData.stayEndDate ? `${formData.stayEndDate}T23:59:59` : null,
      };

      if (editMode) {
        await adminRegistrationApi.updatePeriod(currentPeriodId, payload);
        showSnackbar('Cập nhật đợt đăng ký thành công!', 'success');
      } else {
        await adminRegistrationApi.createPeriod(payload);
        showSnackbar('Tạo mới đợt đăng ký thành công!', 'success');
      }
      handleCloseDialog();
      fetchPeriods();
    } catch (err: any) {
      showSnackbar(err.message || err || 'Thao tác dữ liệu thất bại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [editMode, currentPeriodId, formData, handleCloseDialog, fetchPeriods, showSnackbar]);

  // Bật/Tắt trạng thái đợt đăng ký (Bổ sung confirm box nâng cao trải nghiệm UX)
  const handleToggleStatus = useCallback(
    (id: string, isActive: boolean) => async () => {
      try {
        if (isActive) {
          await adminRegistrationApi.deactivatePeriod(id);
          showSnackbar('Đã tạm dừng đợt đăng ký thành công!', 'success');
        } else {
          setActivationTargetId(id);
          setActivationConfirmOpen(true);
          return;
        }
        fetchPeriods();
      } catch (err: any) {
        showSnackbar(err.message || err || 'Cập nhật trạng thái thất bại.', 'error');
      }
    },
    [fetchPeriods, showSnackbar]
  );

  return {
    periods,
    loading,
    isSubmitting,
    error,
    openDialog,
    editMode,
    formData,
    snackbar,
    eligibilityDialogOpen,
    selectedPeriodForEligibility,
    activationConfirmOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenEligibility,
    handleCloseDialog,
    handleCloseEligibility,
    handleCloseActivationConfirm,
    handleConfirmActivation,
    handleFormChange,
    handleCloseSnackbar,
    handleSubmitPeriod,
    handleToggleStatus,
  };
}
