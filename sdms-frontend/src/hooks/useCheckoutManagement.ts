import { useState, useEffect, useCallback } from 'react';

import checkoutApi from '@/api/checkout-api';
import { snackbar } from '@/helpers/snackbar';
import type { CheckoutRequestResponse } from '@/types/checkout';

export const useCheckoutManagement = () => {
  const [requests, setRequests] = useState<CheckoutRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);

  const [openReview, setOpenReview] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CheckoutRequestResponse | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED' | 'COMPLETED'>('APPROVED');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await checkoutApi.getAllCheckoutRequests(
        statusFilter === 'ALL' ? undefined : statusFilter,
        startDate,
        endDate,
        page,
        rowsPerPage
      );
      setRequests(data.content || []);
      setTotalElements(data.totalElements || 0);
      setSelectedRequestIds([]); // Clear selection on fetch
    } catch (err: any) {
      console.error(err);
      snackbar.error('Lỗi khi tải danh sách đơn trả phòng');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, startDate, endDate, page, rowsPerPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleOpenReview = (request: CheckoutRequestResponse, status: 'APPROVED' | 'REJECTED' | 'COMPLETED') => {
    setSelectedRequest(request);
    setReviewStatus(status);
    setRejectReason('');
    setOpenReview(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedRequest) return;
    if (reviewStatus === 'REJECTED' && !rejectReason.trim()) {
      snackbar.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setSubmitting(true);
    try {
      await checkoutApi.reviewCheckoutRequest(selectedRequest.requestId, {
        status: reviewStatus,
        rejectReason: reviewStatus === 'REJECTED' ? rejectReason : undefined,
      });
      snackbar.success('Xét duyệt đơn trả phòng thành công!');
      setOpenReview(false);
      fetchRequests();
    } catch (err: any) {
      console.error(err);
      snackbar.error(err.response?.data?.message || 'Lỗi khi duyệt đơn');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkReviewSubmit = async (status: 'APPROVED' | 'COMPLETED') => {
    if (selectedRequestIds.length === 0) {
      snackbar.warning('Vui lòng chọn ít nhất một đơn');
      return;
    }

    setSubmitting(true);
    try {
      await checkoutApi.bulkReviewCheckoutRequests(selectedRequestIds, status);
      snackbar.success(`Đã xử lý hàng loạt thành công ${selectedRequestIds.length} đơn!`);
      setSelectedRequestIds([]);
      fetchRequests();
    } catch (err: any) {
      console.error(err);
      snackbar.error(err.response?.data?.message || 'Lỗi khi duyệt hàng loạt');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    requests,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalElements,
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedRequestIds,
    setSelectedRequestIds,
    openReview,
    setOpenReview,
    selectedRequest,
    reviewStatus,
    rejectReason,
    setRejectReason,
    submitting,
    handleOpenReview,
    handleReviewSubmit,
    handleBulkReviewSubmit,
  };
};
