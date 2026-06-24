import React from 'react';
import { Chip, Box, Typography } from '@mui/material';

const getStatusProps = (status) => {
  switch (status) {
    case 'PENDING':
      return { label: 'Chờ duyệt', color: 'info' };
    case 'WAITING_PAYMENT':
      return { label: 'Chờ thanh toán', color: 'warning' };
    case 'APPROVED':
      return { label: 'Đã duyệt', color: 'success' };
    case 'REJECTED':
      return { label: 'Đã từ chối', color: 'error' };
    case 'REQUEST_REVISION':
      return { label: 'Yêu cầu bổ sung', color: 'secondary' };
    default:
      return { label: 'Không xác định', color: 'default' };
  }
};

const StatusIndicator = ({ status }) => {
  const { label, color } = getStatusProps(status);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Trạng thái hồ sơ: <Chip label={label} color={color} />
      </Typography>
    </Box>
  );
};

export default StatusIndicator;
