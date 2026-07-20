import {Box, Typography, Alert, Paper, Stack} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {
    ApartmentOutlined,
    KingBedOutlined,
    MeetingRoomOutlined,
    LayersOutlined,
    CheckCircleOutline
} from '@mui/icons-material';
import React from 'react';

const AssignmentInfo = ({assignment, applicationStatus}: any) => {
    if (!assignment) {
        return null;
    }

    const isPending = applicationStatus === 'PENDING';
    const isWaitingPayment = applicationStatus === 'WAITING_PAYMENT';
    const isApproved = applicationStatus === 'APPROVED';

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 3,
                mb: 3,
                borderRadius: 4,
                borderColor: 'divider',
                bgcolor: 'background.default'
            }}
        >
            <Typography variant="h6" sx={{fontWeight: 800, mb: 2, color: 'text.primary'}}>
                Thông tin xếp phòng nội trú
            </Typography>

            {isPending && (
                <Box
                    sx={(theme) => ({
                        mb: 3,
                        p: 2,
                        pl: 2.5,
                        bgcolor: alpha(theme.palette.warning.main, 0.04),
                        borderLeft: '4px solid',
                        borderColor: 'warning.main',
                        borderRadius: '0 12px 12px 0',
                    })}
                >
                    <Typography variant="body2" color="text.secondary" sx={{lineHeight: 1.6}}>
                        Đây là phòng <strong>dự kiến</strong> hệ thống cấp cho bạn. Vui lòng chờ Cán bộ duyệt hồ
                        sơ trực tuyến trực tiếp trước khi chuyển sang bước đóng tiền.
                    </Typography>
                </Box>
            )}

            {isWaitingPayment && (
                <Alert severity="info" sx={{mb: 3, borderRadius: 3, fontWeight: 500}}>
                    Hồ sơ hợp lệ! Đây là phòng <strong>giữ chỗ dự kiến</strong>. Vui lòng hoàn tất thanh toán
                    hóa đơn bên dưới để hệ thống chốt giữ giường chính thức.
                </Alert>
            )}

            <Stack
                direction={{xs: 'column', sm: 'row'}}
                spacing={2}
                useFlexGap
                flexWrap="wrap"
                sx={{mt: 1, mb: isApproved ? 2 : 0}}
            >
                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                        flex: '1 1 calc(50% - 8px)',
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <ApartmentOutlined color="primary"/>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Tòa nhà</Typography>
                        <Typography variant="body1" sx={{fontWeight: 700}}>{assignment.buildingName}</Typography>
                    </Box>
                </Stack>

                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                        flex: '1 1 calc(50% - 8px)',
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <LayersOutlined color="primary"/>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Tầng</Typography>
                        <Typography variant="body1" sx={{fontWeight: 700}}>{assignment.floorName}</Typography>
                    </Box>
                </Stack>

                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                        flex: '1 1 calc(50% - 8px)',
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <MeetingRoomOutlined color="primary"/>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Phòng ở</Typography>
                        <Typography variant="body1" sx={{fontWeight: 700}}>{assignment.roomName}</Typography>
                    </Box>
                </Stack>

                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                        flex: '1 1 calc(50% - 8px)',
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <KingBedOutlined color="primary"/>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Vị trí giường</Typography>
                        <Typography variant="body1" sx={{fontWeight: 700}}>{assignment.bedName}</Typography>
                    </Box>
                </Stack>
            </Stack>

            {isApproved && (
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                        mt: 2.5,
                        p: 2,
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                        borderRadius: 3,
                        color: 'success.main'
                    }}
                >
                    <CheckCircleOutline color="success"/>
                    <Typography variant="body1" sx={{fontWeight: 700}}>
                        Đã xác nhận xếp phòng CHÍNH THỨC (Hồ sơ hoàn tất & Đã nộp tiền phòng)
                    </Typography>
                </Stack>
            )}
        </Paper>
    );
};

export default AssignmentInfo;