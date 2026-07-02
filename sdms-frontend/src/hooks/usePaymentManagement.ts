import { useState, useEffect, useCallback, useMemo } from 'react';

import { paymentApi } from '@/api';

export interface IBillAdmin {
  billId: string;
  billCode: string;
  studentName: string;
  amount: number;
  status: string;
  billType: string;
  dueDate: string;
  createdAt?: string;
  [key: string]: any;
}

export const usePaymentManagement = () => {
  const [bills, setBills] = useState<IBillAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái bộ lọc dữ liệu trên giao diện
  const [currentTab, setCurrentTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [billTypeFilter, setBillTypeFilter] = useState('ALL');

  // Trạng thái điều khiển Dialogs
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<IBillAdmin | null>(null);

  // Trạng thái thông báo hệ thống
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await paymentApi.getAllBills();
      const data = (res as any)?.data || res;
      setBills((data as IBillAdmin[]) || []);
    } catch (err: any) {
      console.error('Failed to fetch bills:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Không thể tải danh sách hóa đơn từ máy chủ.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleConfirmCashPayment = async () => {
    if (!selectedBill) return;
    try {
      await paymentApi.approveCashPayment({
        billId: selectedBill.billId,
        amount: selectedBill.amount,
      });

      // Cập nhật State cục bộ để UI nhảy sang trạng thái ĐÃ ĐÓNG ngay lập tức
      setBills((prev) =>
        prev.map((b) => (b.billId === selectedBill.billId ? { ...b, status: 'PAID' } : b))
      );
      setConfirmDialog(false);

      setSnackbar({
        open: true,
        message: `Đã gạch nợ tiền mặt thành công cho hóa đơn ${selectedBill.billCode}!`,
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Payment confirmation failed:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Lỗi hệ thống khi xác nhận thu tiền mặt.',
        severity: 'error',
      });
    }
  };

  // 🌟 KHỚP LOGIC MULTI-FILTER TRÁNH TRỐNG UI
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      // 1. Lọc theo trạng thái Tab
      if (currentTab === 'UNPAID' && bill.status !== 'UNPAID' && bill.status !== 'OVERDUE')
        return false;
      if (currentTab === 'PAID' && bill.status !== 'PAID') return false;
      if (currentTab === 'CANCELLED' && bill.status !== 'CANCELLED') return false;

      // 2. Lọc theo danh mục loại phí (Khớp Enum ACCOMMODATION_FEE từ Backend)
      if (billTypeFilter !== 'ALL' && bill.billType !== billTypeFilter) return false;

      // 3. Tìm kiếm theo tên hoặc mã rút gọn
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = bill.studentName?.toLowerCase().includes(query);
        const matchesCode = bill.billCode?.toLowerCase().includes(query);
        return matchesName || matchesCode;
      }

      return true;
    });
  }, [bills, currentTab, billTypeFilter, searchQuery]);

  const openDetails = useCallback((bill: IBillAdmin) => {
    setSelectedBill(bill);
    setDetailsDialog(true);
  }, []);

  const openConfirm = useCallback((bill: IBillAdmin) => {
    setSelectedBill(bill);
    setConfirmDialog(true);
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    bills: filteredBills,
    loading,
    confirmDialog,
    detailsDialog,
    selectedBill,
    snackbar,
    currentTab,
    searchQuery,
    billTypeFilter,
    setCurrentTab,
    setSearchQuery,
    setBillTypeFilter,
    setConfirmDialog,
    setDetailsDialog,
    handleConfirmCashPayment,
    openDetails,
    openConfirm,
    closeSnackbar,
  };
};
