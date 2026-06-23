import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { faceApi } from '@/api';

export const useFaceApproval = () => {
  const { admin } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState('');

  const fetchPendingFaces = useCallback(async () => {
    try {
      setLoading(true);
      const res = await faceApi.getPendingProfiles({ page: 0, size: 50 });
      setProfiles(res.content || []);
    } catch (error) {
      console.error('Failed to fetch pending faces', error);
      setSnackbar({ open: true, message: 'Không thể tải danh sách ảnh chờ duyệt.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingFaces();
  }, [fetchPendingFaces]);

  const handleApprove = async (profileId) => {
    try {
      const adminId = admin?.id || '00000000-0000-0000-0000-000000000000';
      await faceApi.approveFace(profileId, adminId);
      setSnackbar({ open: true, message: 'Đã phê duyệt ảnh khuôn mặt thành công.', severity: 'success' });
      fetchPendingFaces();
    } catch (error) {
      setSnackbar({ open: true, message: `Lỗi: ${error.response?.data?.message || error.message}`, severity: 'error' });
    }
  };

  const handleRejectSubmit = async () => {
    if (!reason.trim() || !rejectTarget) return;
    try {
      await faceApi.rejectFace(rejectTarget, reason.trim());
      setSnackbar({ open: true, message: 'Đã từ chối ảnh khuôn mặt.', severity: 'info' });
      setRejectTarget(null);
      setReason('');
      fetchPendingFaces();
    } catch (error) {
      setSnackbar({ open: true, message: `Lỗi: ${error.response?.data?.message || error.message}`, severity: 'error' });
    }
  };

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  return {
    profiles, loading, snackbar, rejectTarget, reason, setReason, setRejectTarget,
    handleApprove, handleRejectSubmit, closeSnackbar
  };
};