import React from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';

const AssignmentInfo = ({ assignment, applicationStatus }) => {
  // Nếu Backend chưa gán phòng dự kiến (assignment null), tự động ẩn component
  if (!assignment) {
    return null; 
  }

  // 🌟 ĐỒNG BỘ BA GIAI ĐOẠN THEO LUỒNG NGHIỆP VỤ MỚI
  const isPending = applicationStatus === 'PENDING';
  const isWaitingPayment = applicationStatus === 'WAITING_PAYMENT';
  const isApproved = applicationStatus === 'APPROVED';

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3, variant: "outlined" }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
        Thông tin xếp phòng nội trú
      </Typography>

      {/* 🟢 Giai đoạn 1: Sinh viên mới nộp đơn, hồ sơ đang chờ Admin duyệt */}
      {isPending && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontWeight: 'medium' }}>
          Đây là phòng <strong>dự kiến</strong> hệ thống cấp cho bạn. Vui lòng chờ Cán bộ duyệt hồ sơ trực tuyến trực tiếp trước khi chuyển sang bước đóng tiền.
        </Alert>
      )}

      {/* 🟡 Giai đoạn 2: Hồ sơ đã duyệt hợp lệ, chờ sinh viên đóng tiền giữ chỗ */}
      {isWaitingPayment && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontWeight: 'medium' }}>
          Hồ sơ hợp lệ! Đây là phòng <strong>giữ chỗ dự kiến</strong>. Vui lòng hoàn tất thanh toán hóa đơn bên dưới để hệ thống chốt giữ giường chính thức.
        </Alert>
      )}

      {/* THÔNG TIN HẠ TẦNG PHÒNG Ở (Luôn hiển thị khi có dữ liệu) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1, p: 1 }}>
        <Typography variant="body1">
          <strong>Tòa:</strong> {assignment.buildingName}
        </Typography>
        <Typography variant="body1">
          <strong>Tầng:</strong> {assignment.floorName}
        </Typography>
        <Typography variant="body1">
          <strong>Phòng:</strong> {assignment.roomName}
        </Typography>
        <Typography variant="body1">
          <strong>Giường:</strong> {assignment.bedName}
        </Typography>
      </Box>

      {/* 🔵 Giai đoạn 3: Sinh viên đã hoàn tất đóng tiền phòng, phòng chuyển sang chính thức */}
      {isApproved && (
        <Typography 
          variant="body1" 
          color="success.main" 
          sx={{ mt: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
        >
          ✓ Đã xác nhận xếp phòng CHÍNH THỨC (Hồ sơ hoàn tất & Đã nộp tiền phòng)
        </Typography>
      )}
    </Paper>
  );
};

export default AssignmentInfo;