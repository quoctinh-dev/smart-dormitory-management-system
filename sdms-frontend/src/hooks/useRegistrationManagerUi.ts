import { useState, useEffect, useCallback, useMemo } from 'react';

// CHUẨN HÓA TẠI ĐÂY: Gọi đúng phân hệ adminRegistrationApi từ cổng tổng tập trung @/api
import { adminRegistrationApi } from '@/api';
import { snackbar } from '@/helpers/snackbar';
import { RegistrationPeriodResponse } from '@/types/registration';

const INITIAL_FORM_STATE = {
  periodName: '',
  registrationType: 'OPEN_REGISTRATION' as any,
  startDate: '',
  endDate: '',
  stayStartDate: '',
  stayEndDate: '',
};

export function useRegistrationManagerUi() {
  const [periods, setPeriods] = useState<RegistrationPeriodResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPeriodId, setCurrentPeriodId] = useState<string | null>(null);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [selectedPeriodForEligibility, setSelectedPeriodForEligibility] =
    useState<RegistrationPeriodResponse | null>(null);
  const [activationConfirmOpen, setActivationConfirmOpen] = useState(false);
  const [activationTargetId, setActivationTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // States cho bộ lọc
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL'); // Lọc theo năm

  // Tạo danh sách các năm có trong dữ liệu đợt đăng ký (sắp xếp giảm dần)
  const availableYears = useMemo(() => {
    const years = periods
      .map((p) => (p.startDate ? new Date(p.startDate).getFullYear().toString() : ''))
      .filter((y) => y !== '');
    return Array.from(new Set(years)).sort((a, b) => parseInt(b) - parseInt(a));
  }, [periods]);

  // Lọc danh sách (Memoized để tối ưu render)
  const filteredPeriods = useMemo(() => {
    return periods.filter((p) => {
      const matchKeyword =
        filterKeyword === '' || p.periodName.toLowerCase().includes(filterKeyword.toLowerCase());
      const matchType = filterType === 'ALL' || p.registrationType === filterType;

      let matchStatus = true;
      if (filterStatus === 'ACTIVE') matchStatus = p.isActive === true;
      if (filterStatus === 'INACTIVE') matchStatus = p.isActive === false;

      const matchYear =
        filterYear === 'ALL' ||
        (p.startDate && new Date(p.startDate).getFullYear().toString() === filterYear);

      return matchKeyword && matchType && matchStatus && matchYear;
    });
  }, [periods, filterKeyword, filterType, filterStatus, filterYear]);

  // Tải danh sách đợt (Khớp với cơ chế unwrap data của axiosClient)
  const fetchPeriods = useCallback(async () => {
    try {
      setLoading(true);
      setLoading(true);
      const res = await adminRegistrationApi.getAllPeriods();
      const data = (res as any)?.data || res;
      setPeriods((data as RegistrationPeriodResponse[]) || []);
    } catch (err: any) {
      snackbar.error(err.message || err || 'Lỗi hệ thống khi kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const showSnackbar = useCallback(
    (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
      snackbar.show(message, severity);
    },
    []
  );

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
    (period: RegistrationPeriodResponse) => () => {
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
    (period: RegistrationPeriodResponse) => () => {
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
        await adminRegistrationApi.updatePeriod(currentPeriodId as string, payload as any);
        showSnackbar('Cập nhật đợt đăng ký thành công!', 'success');
      } else {
        await adminRegistrationApi.createPeriod(payload as any);
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa cứng đợt đăng ký này? Nếu đợt đã có đơn đăng ký, hệ thống sẽ từ chối.')) return;
    try {
      await adminRegistrationApi.deletePeriod(id);
      showSnackbar('Đã xóa cứng thành công', 'success');
      fetchPeriods();
    } catch (err: any) {
      showSnackbar(err.message || err || 'Xóa thất bại.', 'error');
    }
  };

  return {
    periods: filteredPeriods, // Trả về danh sách đã lọc thay vì toàn bộ
    rawPeriods: periods,
    loading,
    isSubmitting,
    filterKeyword,
    setFilterKeyword,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    filterYear,
    setFilterYear,
    availableYears,
    openDialog,
    editMode,
    formData,
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
    handleSubmitPeriod,
    handleToggleStatus,
    handleDelete,
  };
}
