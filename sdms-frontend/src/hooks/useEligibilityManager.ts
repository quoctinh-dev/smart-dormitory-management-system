import { useState, useEffect, useCallback } from 'react';

import { adminRegistrationApi } from '@/api';
import { snackbar } from '@/helpers/snackbar';
import { RegistrationPeriodResponse } from '@/types/registration';

export interface IEligibility {
  eligibilityId: string;
  cccd: string;
  fullName: string;
  studentCode?: string;
  email?: string;
  [key: string]: any;
}

export const useEligibilityManager = (period: RegistrationPeriodResponse | null, open: boolean) => {
  const [eligibilities, setEligibilities] = useState<IEligibility[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState('');

  const fetchEligibilities = useCallback(async () => {
    if (!period!.periodId) return;
    setLoading(true);

    try {
      const res = await adminRegistrationApi.getEligibilities(
        period!.periodId,
        keyword,
        page,
        size
      );

      const pageData = (res as any)?.data ? (res as any).data : res;

      if (pageData) {
        setEligibilities(pageData.content || []);
        setTotalElements(pageData.totalElements || 0);
      }
    } catch (err: any) {
      snackbar.error('Lỗi khi tải danh sách: ' + (err?.message || 'Không thể kết nối tới server'));
    } finally {
      setLoading(false);
    }
  }, [period, keyword, page, size]);

  useEffect(() => {
    if (open && period) {
      fetchEligibilities();
    }
  }, [open, period, fetchEligibilities]);

  // Xóa sinh viên khỏi danh sách
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminRegistrationApi.deleteEligibility(period!.periodId, deleteTarget);
      snackbar.success('Đã xóa sinh viên khỏi danh sách thành công');

      // Nếu xóa dòng duy nhất còn lại của trang hiện tại (và không phải trang 0), lùi về trang trước
      if (eligibilities.length === 1 && page > 0) {
        setPage((prev) => prev - 1);
      } else {
        fetchEligibilities();
      }
    } catch (err: any) {
      snackbar.error('Lỗi khi xóa: ' + (err?.message || 'Có lỗi xảy ra'));
    } finally {
      setDeleteTarget(null);
    }
  };

  const confirmDeleteAll = async () => {
    try {
      await adminRegistrationApi.deleteAllEligibilities(period!.periodId);
      snackbar.success('Đã xóa toàn bộ sinh viên khỏi danh sách!');
      setPage(0);
      fetchEligibilities();
    } catch (err: any) {
      snackbar.error('Lỗi khi xóa toàn bộ: ' + (err?.message || 'Có lỗi xảy ra'));
    }
  };

  // Import file Excel danh sách sinh viên đủ điều kiện
  const handleImportExcel = async (file: File) => {
    if (!file) return;
    setImporting(true);

    try {
      const result = await adminRegistrationApi.importEligibility(period!.periodId, file);

      if (result) {
        const data = (result as any).data ? (result as any).data : result;

        // Ép kiểu hoặc fallback về 0 nếu chẳng may nhận phải null/undefined
        const imported = data.importedRows ?? 0;
        const skipped = data.skippedRows ?? 0;
        const total = data.totalRows ?? 0;

        snackbar.success(
          `Import thành công! Đã thêm: ${imported}, Bỏ qua: ${skipped} (Tổng: ${total})`
        );

        setPage(0);
        fetchEligibilities();
      }
    } catch (err: any) {
      snackbar.error('Lỗi import: ' + (err?.message || 'Có lỗi xảy ra'));
    } finally {
      setImporting(false);
    }
  };

  return {
    eligibilities,
    loading,
    importing,

    deleteTarget,
    page,
    size,
    totalElements,
    keyword,
    setKeyword,
    setPage,
    setSize,
    setDeleteTarget,

    confirmDelete,
    confirmDeleteAll,
    handleImportExcel,
  };
};
