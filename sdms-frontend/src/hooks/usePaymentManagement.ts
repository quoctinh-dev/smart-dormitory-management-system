import { useState, useEffect, useCallback } from 'react';

import { paymentApi } from '@/api';
import { snackbar } from '@/helpers/snackbar';
import type { BillAdminResponse } from '@/types/payment';

export const usePaymentManagement = () => {
  const [bills, setBills] = useState<BillAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Trạng thái bộ lọc dữ liệu trên giao diện
  const [currentTab, setCurrentTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [billTypeFilter, setBillTypeFilter] = useState('ALL');

  // Tối ưu hóa tìm kiếm (Debounce) để không gọi API liên tục
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Trạng thái điều khiển Dialogs
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [extendDialog, setExtendDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillAdminResponse | null>(null);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await paymentApi.getAllBills({
        page,
        size: rowsPerPage,
        search: debouncedSearch,
        status: currentTab === 'ALL' ? undefined : currentTab,
        billType: billTypeFilter === 'ALL' ? undefined : billTypeFilter,
      });
      const data = res?.content || (res as any)?.data?.content || [];
      const total = res?.totalElements ?? (res as any)?.data?.totalElements ?? 0;
      setBills(data);
      setTotalElements(total);
    } catch (err: any) {
      console.error('Failed to fetch bills:', err);
      snackbar.error(err.message || 'Không thể tải danh sách hóa đơn từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, currentTab, billTypeFilter]);

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

      // Fetch lại để đồng bộ thay vì sửa tay
      fetchBills();
      setConfirmDialog(false);

      snackbar.success(`Đã gạch nợ tiền mặt thành công cho hóa đơn ${selectedBill.billCode}!`);
    } catch (error: any) {
      console.error('Payment confirmation failed:', error);
      snackbar.error(error.message || 'Lỗi hệ thống khi xác nhận thu tiền mặt.');
    }
  };

  const handleCreateManualBill = async (data: { studentId: string; roomId?: string; amount: number; description: string; billType: string; dueDate: string }) => {
    try {
      await paymentApi.createManualBill(data);
      snackbar.success('Tạo hóa đơn thành công!');
      fetchBills();
      return true;
    } catch (error: any) {
      console.error('Failed to create manual bill:', error);
      snackbar.error(error.message || 'Lỗi hệ thống khi tạo hóa đơn.');
      return false;
    }
  };

  const handleExtendDueDate = async (billId: string, newDueDate: string) => {
    try {
      await paymentApi.extendDueDate(billId, { newDueDate });
      snackbar.success('Đã gia hạn hóa đơn thành công!');
      fetchBills();
      setExtendDialog(false);
      return true;
    } catch (error: any) {
      console.error('Failed to extend due date:', error);
      snackbar.error(error.message || 'Lỗi hệ thống khi gia hạn hóa đơn.');
      return false;
    }
  };

  const openDetails = useCallback((bill: BillAdminResponse) => {
    setSelectedBill(bill);
    setDetailsDialog(true);
  }, []);

  const openConfirm = useCallback((bill: BillAdminResponse) => {
    setSelectedBill(bill);
    setConfirmDialog(true);
  }, []);

  const openExtend = useCallback((bill: BillAdminResponse) => {
    setSelectedBill(bill);
    setExtendDialog(true);
  }, []);

  return {
    bills, // Đã lọc từ Backend, không cần filteredBills nữa
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalElements,
    confirmDialog,
    detailsDialog,
    extendDialog,
    selectedBill,
    currentTab,
    searchQuery,
    billTypeFilter,
    setCurrentTab,
    setSearchQuery,
    setBillTypeFilter,
    setConfirmDialog,
    setDetailsDialog,
    setExtendDialog,
    handleConfirmCashPayment,
    handleCreateManualBill,
    handleExtendDueDate,
    openDetails,
    openConfirm,
    openExtend,
  };
};
