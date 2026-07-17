import { useState, useEffect, useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';

import applicationApi from '@/api/applicationApi';
import { useAuth } from '@/auth';
import { getErrorMessage } from '@/types/api';
import { snackbar } from '@/utils/snackbar';
import { ApplicationResponse } from '@/types/application';

export const useApplicationReview = (id: string | undefined, navigate: NavigateFunction) => {
  const { admin } = useAuth();

  const [app, setApp] = useState<ApplicationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [dialogs, setDialogs] = useState({
    reject: false,
    revision: false,
    docVerify: false,
  });

  const [notes, setNotes] = useState({
    reject: '',
    revision: '',
    doc: '',
  });

  const [deadlineDays, setDeadlineDays] = useState(3);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const toggleDialog = (type: 'reject' | 'revision' | 'docVerify', openState: boolean) => {
    setDialogs((prev) => ({ ...prev, [type]: openState }));
  };

  const handleNoteChange =
    (type: 'reject' | 'revision' | 'doc') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setNotes((prev) => ({ ...prev, [type]: e.target.value }));
    };

  const fetchApp = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await applicationApi.getById(id);
      if (data) {
        setApp(data);
      } else {
        snackbar.error('Không tìm thấy thông tin hồ sơ kiểm duyệt!');
        if (navigate) setTimeout(() => navigate('/admin/applications/review'), 2000);
      }
    } catch (error: unknown) {
      console.error(error);
      snackbar.error('Lỗi nạp thông tin chi tiết hồ sơ.');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) fetchApp();
  }, [id, fetchApp]);

  const handleApprove = async () => {
    if (!id) return;
    try {
      await applicationApi.approve(id, 'Được duyệt trên Hệ thống Web Admin');
      snackbar.success('Phê duyệt hồ sơ thành công!');
      fetchApp();
    } catch (error: unknown) {
      snackbar.error(`Lỗi: ${getErrorMessage(error)}`);
    }
  };

  const handleConfirmPayment = async () => {
    if (!id) return;
    try {
      await applicationApi.confirmPayment(id, 'Đã thu tiền mặt');
      snackbar.success('Đã xác nhận thu tiền, hồ sơ được duyệt chính thức!');
      fetchApp();
    } catch (error: unknown) {
      snackbar.error(`Lỗi: ${getErrorMessage(error)}`);
    }
  };

  const handleRejectSubmit = async () => {
    if (!id || !notes.reject.trim()) return;
    try {
      await applicationApi.reject(id, notes.reject.trim());
      toggleDialog('reject', false);
      snackbar.info('Đã từ chối tiếp nhận hồ sơ đăng ký.');
      if (navigate) setTimeout(() => navigate('/admin/applications/review'), 1500);
    } catch (error: unknown) {
      snackbar.error(`Lỗi: ${getErrorMessage(error)}`);
    }
  };

  const handleRequestRevision = async () => {
    if (!id) return;
    try {
      await applicationApi.requestRevision(id, notes.revision, deadlineDays);
      toggleDialog('revision', false);
      snackbar.warning('Đã gửi thông báo yêu cầu sửa đổi hồ sơ.');
      if (navigate) setTimeout(() => navigate('/admin/applications/review'), 1500);
    } catch (error: unknown) {
      snackbar.error(`Lỗi: ${getErrorMessage(error)}`);
    }
  };

  const handleVerifyDocument = async (docId: string, status: string) => {
    try {
      if (status === 'INVALID') {
        setSelectedDocId(docId);
        setNotes((prev) => ({ ...prev, doc: '' }));
        toggleDialog('docVerify', true);
        return;
      }
      await applicationApi.verifyDocument(docId, 'VALID', 'Hợp lệ');
      snackbar.success('Đã xác nhận tài liệu Hợp lệ.');
      fetchApp();
    } catch (error: unknown) {
      snackbar.error(`Lỗi: ${getErrorMessage(error)}`);
    }
  };

  const handleInvalidDocSubmit = async () => {
    if (!selectedDocId || !notes.doc.trim()) return;
    try {
      await applicationApi.verifyDocument(selectedDocId, 'INVALID', notes.doc.trim());
      toggleDialog('docVerify', false);
      snackbar.error('Đã đánh dấu tài liệu Không hợp lệ.');
      fetchApp();
    } catch (error: unknown) {
      snackbar.error(`Lỗi: ${getErrorMessage(error)}`);
    }
  };

  return {
    admin,
    app,
    loading,
    dialogs,
    notes,
    deadlineDays,
    setDeadlineDays,
    toggleDialog,
    handleNoteChange,
    handleApprove,
    handleConfirmPayment,
    handleRejectSubmit,
    handleRequestRevision,
    handleVerifyDocument,
    handleInvalidDocSubmit,
  };
};
