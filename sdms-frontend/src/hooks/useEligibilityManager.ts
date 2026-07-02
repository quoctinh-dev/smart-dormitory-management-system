import { useState, useEffect, useCallback } from 'react';

import { adminRegistrationApi } from '@/api';

import { IRegistrationPeriod } from './useRegistrationManagerUi';

export interface IEligibility {
  eligibilityId: string;
  cccd: string;
  fullName: string;
  [key: string]: any;
}

export const useEligibilityManager = (period: IRegistrationPeriod | null, open: boolean) => {
  const [eligibilities, setEligibilities] = useState<IEligibility[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchEligibilities = useCallback(async () => {
    if (!period?.periodId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminRegistrationApi.getEligibilities(period?.periodId, page, size);

      const pageData = res?.data ? res.data : res;

      if (pageData) {
        setEligibilities(pageData.content || []);
        setTotalElements(pageData.totalElements || 0);
      }
    } catch (err: any) {
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
      await adminRegistrationApi.deleteEligibility(period?.periodId, deleteTarget);
      setSuccessMsg('Đã xóa sinh viên khỏi danh sách thành công');

      // Nếu xóa dòng duy nhất còn lại của trang hiện tại (và không phải trang 0), lùi về trang trước
      if (eligibilities.length === 1 && page > 0) {
        setPage((prev) => prev - 1);
      } else {
        fetchEligibilities();
      }
    } catch (err: any) {
      setError('Lỗi khi xóa: ' + (err?.message || 'Có lỗi xảy ra'));
    } finally {
      setDeleteTarget(null);
    }
  };

  // Import file Excel danh sách sinh viên đủ điều kiện
  const handleImportExcel = async (file: File) => {
    if (!file) return;
    setImporting(true);
    setError(null);
    setSuccessMsg('');

    try {
      const result = await adminRegistrationApi.importEligibility(period?.periodId, file);

      if (result) {
        const data = result.data ? result.data : result;

        // Ép kiểu hoặc fallback về 0 nếu chẳng may nhận phải null/undefined
        const imported = data.imported ?? 0;
        const skipped = data.skipped ?? 0;
        const total = data.total ?? 0;

        setSuccessMsg(
          `Import thành công! Đã thêm: ${imported}, Bỏ qua: ${skipped} (Tổng: ${total})`
        );

        setPage(0);
        fetchEligibilities();
      }
    } catch (err: any) {
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
    handleImportExcel,
  };
};
