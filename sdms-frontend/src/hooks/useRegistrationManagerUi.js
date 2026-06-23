import { useState, useEffect, useCallback } from 'react';
// CHUẨN HÓA TẠI ĐÂY: Gọi đúng phân hệ adminRegistrationApi từ cổng tổng tập trung @/api
import { adminRegistrationApi } from '@/api';

const INITIAL_FORM_STATE = {
  periodName: '',
  registrationType: 'OPEN_REGISTRATION',
  startDate: '',
  endDate: ''
};

export function useRegistrationManagerUi() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPeriodId, setCurrentPeriodId] = useState(null);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [selectedPeriodForEligibility, setSelectedPeriodForEligibility] = useState(null);
  
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Tải danh sách đợt (Khớp với cơ chế unwrap data của axiosClient)
  const fetchPeriods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminRegistrationApi.getAllPeriods();
      setPeriods(data || []);
    } catch (err) {
      setError(err.message || err || 'Lỗi hệ thống khi kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const handleFormChange = useCallback((field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditMode(false);
    setCurrentPeriodId(null);
    setFormData(INITIAL_FORM_STATE);
    setOpenDialog(true);
  }, []);

  const handleOpenEdit = useCallback((period) => () => {
    setEditMode(true);
    setCurrentPeriodId(period.periodId);
    setFormData({
      periodName: period.periodName,
      registrationType: period.registrationType,
      startDate: period.startDate ? new Date(period.startDate).toISOString().slice(0, 16) : '',
      endDate: period.endDate ? new Date(period.endDate).toISOString().slice(0, 16) : ''
    });
    setOpenDialog(true);
  }, []);

  const handleOpenEligibility = useCallback((period) => () => {
    setSelectedPeriodForEligibility(period);
    setEligibilityDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setCurrentPeriodId(null);
  }, []);

  const handleCloseEligibility = useCallback(() => {
    setEligibilityDialogOpen(false);
    setSelectedPeriodForEligibility(null);
  }, []);

  // Xử lý tạo mới / cập nhật đợt
  const handleSubmitPeriod = useCallback(async () => {
    try {
      setIsSubmitting(true);
      if (editMode) {
        await adminRegistrationApi.updatePeriod(currentPeriodId, formData);
        showSnackbar('Cập nhật đợt đăng ký thành công!', 'success');
      } else {
        await adminRegistrationApi.createPeriod(formData);
        showSnackbar('Tạo mới đợt đăng ký thành công!', 'success');
      }
      handleCloseDialog();
      fetchPeriods();
    } catch (err) {
      showSnackbar(err.message || err || 'Thao tác dữ liệu thất bại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [editMode, currentPeriodId, formData, handleCloseDialog, fetchPeriods, showSnackbar]);

  // Bật/Tắt trạng thái đợt đăng ký (Bổ sung confirm box nâng cao trải nghiệm UX)
  const handleToggleStatus = useCallback((id, isActive) => async () => {
    try {
      if (isActive) {
        await adminRegistrationApi.deactivatePeriod(id);
        showSnackbar('Đã tạm dừng đợt đăng ký thành công!', 'success');
      } else {
        // CHỐT CHẶN UX: Cảnh báo Admin trước khi kích hoạt
        const confirm = window.confirm(
          "Hành động này sẽ TẮT TẤT CẢ các đợt đăng ký đang hoạt động khác ngay lập tức. Bạn có chắc chắn muốn kích hoạt đợt này?"
        );
        if (!confirm) return;

        await adminRegistrationApi.activatePeriod(id);
        showSnackbar('Kích hoạt đợt đăng ký thành công!', 'success');
      }
      fetchPeriods();
    } catch (err) {
      showSnackbar(err.message || err || 'Cập nhật trạng thái thất bại.', 'error');
    }
  }, [fetchPeriods, showSnackbar]);

  return {
    periods, loading, isSubmitting, error,
    openDialog, editMode, formData, snackbar, eligibilityDialogOpen, selectedPeriodForEligibility,
    handleOpenCreate, handleOpenEdit, handleOpenEligibility, handleCloseDialog, handleCloseEligibility,
    handleFormChange, handleCloseSnackbar, handleSubmitPeriod, handleToggleStatus
  };
}