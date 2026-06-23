import { useState, useEffect, useCallback } from 'react';
import { adminRegistrationApi } from '@/api';

export const useEligibilityManager = (period, open) => {
  const [eligibilities, setEligibilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchEligibilities = useCallback(async () => {
    if (!period?.periodId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminRegistrationApi.getEligibilities(period.periodId, page, size);
      
      if (res) {
        setEligibilities(res.content || []);
        setTotalElements(res.totalElements || 0);
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách: ' + (err?.message || 'Không thể kết nối tới server'));
    } finally {
      setLoading(false);
    }
  }, [period, page, size]);

  useEffect(() => {
    if (open && period) {
      fetchEligibilities();
    }
  }, [open, period, fetchEligibilities]);

  // Xóa sinh viên khỏi danh sách
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminRegistrationApi.deleteEligibility(period.periodId, deleteTarget);
      setSuccessMsg('Đã xóa sinh viên khỏi danh sách thành công');
      
      // Nếu xóa dòng duy nhất còn lại của trang hiện tại (và không phải trang 0), lùi về trang trước
      if (eligibilities.length === 1 && page > 0) {
        setPage(prev => prev - 1);
      } else {
        fetchEligibilities();
      }
    } catch (err) {
      setError('Lỗi khi xóa: ' + (err?.message || 'Có lỗi xảy ra'));
    } finally {
      setDeleteTarget(null);
    }
  };

  // Import file Excel danh sách sinh viên đủ điều kiện
  const handleImportExcel = async (file) => {
    if (!file) return;
    setImporting(true);
    setError(null);
    setSuccessMsg('');

    try {
      const result = await adminRegistrationApi.importEligibility(period.periodId, file);
      
      if (result) {
        setSuccessMsg(`Import thành công! Đã thêm: ${result.imported}, Bỏ qua: ${result.skipped} (Tổng: ${result.total})`);
        
        setPage(0); // Đưa Admin về trang đầu tiên để nhìn thấy dữ liệu mới cập nhật
        fetchEligibilities();
      }
    } catch (err) {
      setError('Lỗi import: ' + (err?.message || 'Có lỗi xảy ra'));
    } finally {
      setImporting(false);
    }
  };

  return {
    eligibilities, 
    loading, 
    importing, 
    error, 
    successMsg, 
    deleteTarget,
    page,
    size,
    totalElements,
    setPage,
    setSize,
    setDeleteTarget, 
    setError, 
    setSuccessMsg, 
    confirmDelete, 
    handleImportExcel
  };
};