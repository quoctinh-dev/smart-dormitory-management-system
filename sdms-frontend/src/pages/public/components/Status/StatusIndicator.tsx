import { Chip, Box, Typography } from '@mui/material';
import React from 'react';

const getStatusProps = (status: string): { label: string; color: any } => {
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

const StatusIndicator = ({ status }: any) => {
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
