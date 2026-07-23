import { Box, Typography } from '@mui/material';
import {
  HourglassEmptyOutlined,
  PaymentOutlined,
  CheckCircleOutline,
  CancelOutlined,
  ErrorOutline,
  FormatListBulletedOutlined,
  HelpOutline
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import React from 'react';

const getStatusProps = (status: string): { label: string; color: string; description: string; icon: React.ReactNode } => {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Chờ xét duyệt',
        color: 'info',
        description: 'Hồ sơ của bạn đã được tiếp nhận thành công và đang chờ Ban quản lý KTX kiểm tra.',
        icon: <HourglassEmptyOutlined />
      };
    case 'WAITING_PAYMENT':
      return {
        label: 'Chờ thanh toán',
        color: 'warning',
        description: 'Hồ sơ hợp lệ. Vui lòng hoàn tất đóng phí nội trú đúng hạn để chính thức giữ chỗ.',
        icon: <PaymentOutlined />
      };
    case 'APPROVED':
      return {
        label: 'Đã phê duyệt chính thức',
        color: 'success',
        description: 'Chúc mừng bạn đã trở thành cư dân nội trú tại Ký túc xá STU.',
        icon: <CheckCircleOutline />
      };
    case 'REJECTED':
      return {
        label: 'Từ chối tiếp nhận',
        color: 'error',
        description: 'Hồ sơ không đáp ứng đủ điều kiện hoặc Ký túc xá đã hết chỗ lưu trú.',
        icon: <CancelOutlined />
      };
    case 'REQUEST_REVISION':
      return {
        label: 'Yêu cầu bổ sung hồ sơ',
        color: 'secondary',
        description: 'Phát hiện thông tin hoặc giấy tờ đính kèm chưa chính xác. Vui lòng chỉnh sửa lại phía dưới.',
        icon: <ErrorOutline />
      };
    case 'WAITING_LIST':
      return {
        label: 'Nằm trong danh sách chờ',
        color: 'secondary',
        description: 'Hiện tại số lượng đăng ký vượt quá chỉ tiêu. Hồ sơ đang được xếp vào hàng đợi bổ sung.',
        icon: <FormatListBulletedOutlined />
      };
    default:
      return {
        label: 'Trạng thái không xác định',
        color: 'default',
        description: 'Hệ thống không thể định dạng trạng thái hiện tại của hồ sơ này.',
        icon: <HelpOutline />
      };
  }
};

const StatusIndicator = ({ status }: any) => {
  const { label, color, description, icon } = getStatusProps(status);

  return (
      <Box
          sx={(theme) => {
            type ColorType = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
            const safeColor = color as ColorType;
            const activeBg = color === 'default' ? theme.palette.action.hover : alpha(theme.palette[safeColor].main, 0.04);
            const activeBorder = color === 'default' ? theme.palette.divider : alpha(theme.palette[safeColor].main, 0.2);

            return {
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2.5,
              p: 3,
              mb: 4,
              borderRadius: 4,
              bgcolor: activeBg,
              border: '1px solid',
              borderColor: activeBorder,
            };
          }}
      >
        <Box
            sx={(theme) => {
              type ColorType = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
              const safeColor = color as ColorType;
              return {
                display: 'flex',
                p: 1.2,
                borderRadius: 3,
                bgcolor: color === 'default' ? 'divider' : alpha(theme.palette[safeColor].main, 0.1),
                color: color === 'default' ? 'text.secondary' : `${color}.main`,
                '& svg': { fontSize: '1.5rem' }
              };
            }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                fontFamily: 'inherit',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mb: 0.5,
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased'
              }}
          >
            Trạng thái hồ sơ
          </Typography>
          <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontFamily: 'inherit',
                color: color === 'default' ? 'text.primary' : `${color}.main`,
                mb: 0.5,
                lineHeight: 1.3,
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased'
              }}
          >
            {label}
          </Typography>
          <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 400,
                fontFamily: 'inherit',
                opacity: 0.9,
                lineHeight: 1.5,
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased'
              }}
          >
            {description}
          </Typography>
        </Box>
      </Box>
  );
};

export default StatusIndicator;