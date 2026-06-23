import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/auth';
import applicationApi from '@/api/applicationApi';

export const useApplicationReview = (id, navigate) => {
  const { admin } = useAuth();
  
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // States quản lý trạng thái đóng/mở và dữ liệu của các Dialog
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
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Hàm tiện ích đóng/mở nhanh các dialog chuyên trách
  const toggleDialog = (type, openState) => {
    setDialogs((prev) => ({ ...prev, [type]: openState }));
  };

  const handleNoteChange = (type) => (e) => {
    setNotes((prev) => ({ ...prev, [type]: e.target.value }));
  };

  const fetchApp = useCallback(async () => {
    try {
      const res = await applicationApi.getAll({ page: 0, size: 100 });
      const found = res?.content?.find(a => a.applicationId === id);
      if (found) {
        setApp(found);
      } else {
        setSnackbar({ open: true, message: 'Không tìm thấy thông tin hồ sơ kiểm duyệt!', severity: 'error' });
        if (navigate) setTimeout(() => navigate('/admin/applications/review'), 2000);
      }
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Lỗi nạp thông tin chi tiết hồ sơ.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) fetchApp();
  }, [id, fetchApp]);

  // Hành động 1: Duyệt hồ sơ hợp lệ
  const handleApprove = async () => {
    try {
      await applicationApi.approve(id, 'Được duyệt trên Hệ thống Web Admin');
      setSnackbar({ open: true, message: 'Phê duyệt hồ sơ thành công!', severity: 'success' });
      if (navigate) setTimeout(() => navigate('/admin/applications/review'), 1500);
    } catch (error) {
      setSnackbar({ open: true, message: `Lỗi: ${error.response?.data?.message || error.message}`, severity: 'error' });
    }
  };

  // Hành động 2: Xác nhận từ chối hồ sơ
  const handleRejectSubmit = async () => {
    if (!notes.reject.trim()) return;
    try {
      await applicationApi.reject(id, notes.reject.trim());
      toggleDialog('reject', false);
      setSnackbar({ open: true, message: 'Đã từ chối tiếp nhận hồ sơ đăng ký.', severity: 'info' });
      if (navigate) setTimeout(() => navigate('/admin/applications/review'), 1500);
    } catch (error) {
      setSnackbar({ open: true, message: `Lỗi: ${error.response?.data?.message || error.message}`, severity: 'error' });
    }
  };

  // Hành động 3: Gửi yêu cầu sinh viên sửa đổi bổ sung
  const handleRequestRevision = async () => {
    try {
      await applicationApi.requestRevision(id, notes.revision, deadlineDays);
      toggleDialog('revision', false);
      setSnackbar({ open: true, message: 'Đã gửi thông báo yêu cầu sửa đổi hồ sơ.', severity: 'warning' });
      if (navigate) setTimeout(() => navigate('/admin/applications/review'), 1500);
    } catch (error) {
      setSnackbar({ open: true, message: `Lỗi: ${error.response?.data?.message || error.message}`, severity: 'error' });
    }
  };

  // Hành động 4: Kiểm duyệt trạng thái từng ảnh minh chứng lẻ
  const handleVerifyDocument = async (docId, status) => {
    try {
      if (status === 'INVALID') {
        setSelectedDocId(docId);
        setNotes((prev) => ({ ...prev, doc: '' }));
        toggleDialog('docVerify', true);
        return;
      }
      await applicationApi.verifyDocument(docId, 'VALID', 'Hợp lệ');
      setSnackbar({ open: true, message: 'Đã xác nhận tài liệu Hợp lệ.', severity: 'success' });
      fetchApp();
    } catch (error) {
      setSnackbar({ open: true, message: `Lỗi: ${error.response?.data?.message || error.message}`, severity: 'error' });
    }
  };

  // Hành động 5: Xác nhận ảnh minh chứng bị sai lý do gì
  const handleInvalidDocSubmit = async () => {
    if (!notes.doc.trim()) return;
    try {
      await applicationApi.verifyDocument(selectedDocId, 'INVALID', notes.doc.trim());
      toggleDialog('docVerify', false);
      setSnackbar({ open: true, message: 'Đã đánh dấu tài liệu Không hợp lệ.', severity: 'error' });
      fetchApp();
    } catch (error) {
      setSnackbar({ open: true, message: `Lỗi: ${error.response?.data?.message || error.message}`, severity: 'error' });
    }
  };

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  return {
    admin, app, loading, dialogs, notes, deadlineDays, snackbar,
    setDeadlineDays, toggleDialog, handleNoteChange, handleApprove,
    handleRejectSubmit, handleRequestRevision, handleVerifyDocument,
    handleInvalidDocSubmit, closeSnackbar
  };
};