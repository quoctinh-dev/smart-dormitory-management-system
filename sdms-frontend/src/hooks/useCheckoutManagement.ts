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

  const [openReview, setOpenReview] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CheckoutRequestResponse | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await checkoutApi.getAllCheckoutRequests(
        statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        rowsPerPage
      );
      setRequests(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      console.error(err);
      snackbar.error('Lỗi khi tải danh sách đơn trả phòng');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleOpenReview = (request: CheckoutRequestResponse, status: 'APPROVED' | 'REJECTED') => {
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
    openReview,
    setOpenReview,
    selectedRequest,
    reviewStatus,
    rejectReason,
    setRejectReason,
    submitting,
    handleOpenReview,
    handleReviewSubmit,
  };
};
