import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/auth';
import applicationApi from '@/api/applicationApi';

export const useApplicationReview = (id, navigate) => {
  const { admin } = useAuth();
  
  const [app, setApp] = useState(null);
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
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const toggleDialog = (type, openState) => {
    setDialogs((prev) => ({ ...prev, [type]: openState }));
  };

  const handleNoteChange = (type) => (e) => {
    setNotes((prev) => ({ ...prev, [type]: e.target.value }));
  };

  // 🌟 TỐI ƯU TẠI ĐÂY: Gọi đích danh API lấy chi tiết thay vì quét mảng 100 phần tử
  const fetchApp = useCallback(async () => {
    try {
      setLoading(true);
      // Giả định hàm lấy chi tiết của bạn tên là getDetail hoặc getById
      // Nếu file api của bạn chỉ có hàm getAll, hãy bổ sung hàm getById(id) vào nhé!
      const res = await applicationApi.getById(id); 
      
      // Unwrap data theo chuẩn của axiosClient của bạn
      const data = res?.data ? res.data : res;

      if (data) {
        setApp(data);
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

  const handleApprove = async () => {
    try {
      await applicationApi.approve(id, 'Được duyệt trên Hệ thống Web Admin');
      setSnackbar({ open: true, message: 'Phê duyệt hồ sơ thành công!', severity: 'success' });
      if (navigate) setTimeout(() => navigate('/admin/applications/review'), 1500);
    } catch (error) {
      setSnackbar({ open: true, message: `Lỗi: ${error.response?.data?.message || error.message}`, severity: 'error' });
    }
  };

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
      fetchApp(); // Reload mượt vì data dung lượng nhỏ
    } catch (error) {
      setSnackbar({ open: true, message: `Lỗi: ${error.response?.data?.message || error.message}`, severity: 'error' });
    }
  };

  const handleInvalidDocSubmit = async () => {
    if (!notes.doc.trim()) return;
    try {
      await applicationApi.verifyDocument(selectedDocId, 'INVALID', notes.doc.trim());
      toggleDialog('docVerify', false);
      setSnackbar({ open: true, message: 'Đã đánh dấu tài liệu Không hợp lệ.', severity: 'error' });
      fetchApp(); // Reload mượt vì data dung lượng nhỏ
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