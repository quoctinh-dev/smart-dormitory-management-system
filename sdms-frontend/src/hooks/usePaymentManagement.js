import { useState, useEffect, useCallback, useMemo } from 'react';
// ĐÚNG CHUẨN: Sử dụng Absolute Import và Barrel Export từ bộ gom @/api
import { paymentApi } from '@/api'; 

export const usePaymentManagement = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Các trạng thái bộ lọc dữ liệu trên giao diện (UI Filters)
  const [currentTab, setCurrentTab] = useState('ALL'); // ALL, UNPAID, PAID, CANCELLED
  const [searchQuery, setSearchQuery] = useState('');
  const [billTypeFilter, setBillTypeFilter] = useState('ALL'); // ALL, ACCOMMODATION, SERVICE, FINE, OTHER

  // Trạng thái điều khiển Dialogs
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  
  // Trạng thái thông báo hệ thống
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ĐÚNG CHUẨN: Nhận trực tiếp dữ liệu nghiệp vụ đã bóc tách từ Axios Interceptor, không check .success
  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentApi.getAllBills();
      setBills(data || []);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
      setSnackbar({ 
        open: true, 
        message: err.message || 'Không thể tải danh sách hóa đơn từ máy chủ.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // ĐÚNG CHUẨN: Tác vụ ghi nhận thanh toán tiền mặt xử lý bất đồng bộ, cập nhật State cục bộ tối ưu hiệu năng
  const handleConfirmCashPayment = async () => {
    if (!selectedBill) return;
    try {
      await paymentApi.approveCashPayment({
        billId: selectedBill.billId,
        amount: selectedBill.amount
      });
      
      // Gập nhật nhanh trạng thái tại client-side giúp UI thay đổi lập tức mà không cần fetch lại toàn bộ danh sách
      setBills(prev => prev.map(b => b.billId === selectedBill.billId ? { ...b, status: 'PAID' } : b));
      setConfirmDialog(false);
      
      setSnackbar({
        open: true,
        message: `Đã xác nhận thu tiền mặt thành công cho hóa đơn ${selectedBill.billCode}!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Lỗi hệ thống khi xác nhận thu tiền mặt.',
        severity: 'error'
      });
    }
  };

  // ĐÚNG CHUẨN KỸ THUẬT: Thực hiện lọc kết hợp (Multi-filter) ở Client-side bọc trong useMemo tránh Re-render thừa
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      // 1. Bộ lọc 1: Theo Tab trạng thái hóa đơn (Map UNPAID gộp luôn cả trạng thái OVERDUE quá hạn)
      if (currentTab === 'UNPAID' && bill.status !== 'UNPAID' && bill.status !== 'OVERDUE') return false;
      if (currentTab === 'PAID' && bill.status !== 'PAID') return false;
      if (currentTab === 'CANCELLED' && bill.status !== 'CANCELLED') return false;

      // 2. Bộ lọc 2: Theo loại cấu hình danh mục phí nghiệp vụ (BillType)
      if (billTypeFilter !== 'ALL' && bill.billType !== billTypeFilter) return false;

      // 3. Bộ lọc 3: Tìm kiếm tương đối theo Tên sinh viên hoặc Mã hóa đơn rút gọn
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = bill.studentName?.toLowerCase().includes(query);
        const matchesCode = bill.billCode?.toLowerCase().includes(query);
        return matchesName || matchesCode;
      }

      return true;
    });
  }, [bills, currentTab, billTypeFilter, searchQuery]);

  const openDetails = useCallback((bill) => {
    setSelectedBill(bill);
    setDetailsDialog(true);
  }, []);

  const openConfirm = useCallback((bill) => {
    setSelectedBill(bill);
    setConfirmDialog(true);
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
    closeSnackbar
  };
};