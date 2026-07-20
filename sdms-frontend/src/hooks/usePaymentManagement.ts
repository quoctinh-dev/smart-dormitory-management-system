import { useState, useEffect, useCallback, useMemo } from 'react';

import { paymentApi } from '@/api';
import { snackbar } from '@/helpers/snackbar';
import type { BillAdminResponse } from '@/types/payment';

export const usePaymentManagement = () => {
  const [bills, setBills] = useState<BillAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái bộ lọc dữ liệu trên giao diện
  const [currentTab, setCurrentTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [billTypeFilter, setBillTypeFilter] = useState('ALL');

  // Trạng thái điều khiển Dialogs
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillAdminResponse | null>(null);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await paymentApi.getAllBills();
      // axiosClient unwraps ApiResponse.data -> which is PageResponse<BillAdminResponse>
      const data = res?.content || (res as any)?.data?.content || [];
      setBills(data);
    } catch (err: any) {
      console.error('Failed to fetch bills:', err);
      snackbar.error(err.message || 'Không thể tải danh sách hóa đơn từ máy chủ.');
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

      snackbar.success(`Đã gạch nợ tiền mặt thành công cho hóa đơn ${selectedBill.billCode}!`);
    } catch (error: any) {
      console.error('Payment confirmation failed:', error);
      snackbar.error(error.message || 'Lỗi hệ thống khi xác nhận thu tiền mặt.');
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

  const openDetails = useCallback((bill: BillAdminResponse) => {
    setSelectedBill(bill);
    setDetailsDialog(true);
  }, []);

  const openConfirm = useCallback((bill: BillAdminResponse) => {
    setSelectedBill(bill);
    setConfirmDialog(true);
  }, []);

  return {
    bills: filteredBills,
    loading,
    confirmDialog,
    detailsDialog,
    selectedBill,
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
  };
};
