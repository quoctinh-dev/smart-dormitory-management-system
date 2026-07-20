import { useState, useEffect } from 'react';

import stayExtensionApi from '@/api/stay-extension-api';
import { snackbar } from '@/helpers/snackbar';
import type { StayExtensionResponse } from '@/types/stay-extension';
import axiosClient from '@/api/axios-client';

export const useStayExtensionManagement = () => {
  const [extensions, setExtensions] = useState<StayExtensionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [openReview, setOpenReview] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StayExtensionResponse | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Profile Modal State
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchExtensions = async (p: number, size: number) => {
    setLoading(true);
    try {
      const data = await stayExtensionApi.getAllExtensions(p, size);
      setExtensions(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      console.error(err);
      snackbar.error('Lỗi khi tải danh sách gia hạn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExtensions(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleOpenReview = (request: StayExtensionResponse, status: 'APPROVED' | 'REJECTED') => {
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
      await stayExtensionApi.reviewExtension(selectedRequest.extensionId, {
        status: reviewStatus,
        rejectReason: reviewStatus === 'REJECTED' ? rejectReason : undefined,
      });
      snackbar.success('Xét duyệt đơn gia hạn thành công!');
      setOpenReview(false);
      fetchExtensions(page, rowsPerPage);
    } catch (err: any) {
      console.error(err);
      snackbar.error(err.response?.data?.message || 'Lỗi khi duyệt đơn');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenProfile = async (studentId: string) => {
    setOpenProfileModal(true);
    setLoadingProfile(true);
    try {
      const { data } = await axiosClient.get(`/api/v1/students/${studentId}/profile`);
      setSelectedProfile(data.data);
    } catch (error) {
      console.error(error);
      snackbar.error('Không thể tải thông tin sinh viên');
    } finally {
      setLoadingProfile(false);
    }
  };

  return {
    extensions,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalElements,
    openReview,
    setOpenReview,
    selectedRequest,
    reviewStatus,
    rejectReason,
    setRejectReason,
    submitting,
    handleOpenReview,
    handleReviewSubmit,
    openProfileModal,
    setOpenProfileModal,
    selectedProfile,
    loadingProfile,
    handleOpenProfile,
  };
};
