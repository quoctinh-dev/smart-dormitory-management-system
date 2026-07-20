import { Box, Typography } from '@mui/material';

import { IconifyIcon } from '@/components/base/IconifyIcon';

export default function SuccessSection() {
    return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
            <IconifyIcon
                icon="mingcute:check-circle-fill"
                sx={{ fontSize: 80, color: 'success.main', mb: 3 }}
            />

            <Typography variant="h4" sx={{ fontWeight: 900, textAlign: 'center', mt: 2 }}>
                Nộp Hồ Sơ Thành Công!
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    color: 'text.secondary',
                    textAlign: 'center',
                    maxWidth: 400,
                    mx: 'auto',
                    fontSize: '1.1rem',
                }}
            >
                Hồ sơ của bạn đã được ghi nhận vào hệ thống và đang chờ Ban Quản Lý xét duyệt. Bạn có thể
                tra cứu trạng thái hồ sơ tại bất kỳ thời điểm nào.
            </Typography>
        </Box>
    );
}