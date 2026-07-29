import { Skeleton } from '@mui/material';
import { Box, Stack, Paper, Container } from '@mui/material';

type SkeletonVariant = 'circular' | 'rectangular' | 'rounded' | 'text';

interface SkeletonItemProps {
    variant?: SkeletonVariant;
    width?: number | string;
    height?: number | string;
    sx?: object;
}

const SkeletonItem = ({ variant, width, height, sx }: SkeletonItemProps) => (
    <Skeleton
        animation="wave"
        variant={variant}
        width={width}
        height={height}
        sx={{
            bgcolor: 'grey.200',
            // Chống méo (squish) đối với dạng hình tròn khi nằm trong Flexbox
            ...(variant === 'circular' && { flexShrink: 0 }),
            ...sx
        }}
    />
);

export type SkeletonType = 'table' | 'form' | 'dashboard' | 'card' | 'list' | 'home' | 'page';

interface CustomSkeletonProps {
    type?: SkeletonType;
    count?: number;
}

// ==========================================
// SUB-COMPONENTS (Tối ưu code, dễ đọc, dễ sửa)
// ==========================================

const DashboardSkeleton = () => (
    <Box sx={{ width: '100%' }}>
        {/* Page Title */}
        <SkeletonItem variant="rounded" width={200} height={36} sx={{ mb: 4 }} />
        
        {/* Summary Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
            {Array.from({ length: 4 }).map((_, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <SkeletonItem variant="circular" width={48} height={48} />
                        <SkeletonItem variant="rounded" width="30%" height={24} />
                    </Box>
                    <SkeletonItem variant="text" width="70%" height={32} sx={{ mb: 1 }} />
                    <SkeletonItem variant="text" width="40%" height={20} />
                </Paper>
            ))}
        </Box>
        
        {/* Charts / Data Panels */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: 400 }}>
                <SkeletonItem variant="text" width="30%" height={28} sx={{ mb: 4 }} />
                <SkeletonItem variant="rounded" width="100%" height={280} sx={{ borderRadius: 2 }} />
            </Paper>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: 400 }}>
                <SkeletonItem variant="text" width="30%" height={28} sx={{ mb: 4 }} />
                <SkeletonItem variant="rounded" width="100%" height={280} sx={{ borderRadius: 2 }} />
            </Paper>
        </Box>
    </Box>
);

const TableSkeleton = ({ count }: { count: number }) => (
    <Paper variant="outlined" sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper', mt: 2 }}>
        {/* Toolbar */}
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <SkeletonItem variant="rounded" width={250} height={40} />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
                <SkeletonItem variant="rounded" width={100} height={40} />
                <SkeletonItem variant="rounded" width={100} height={40} />
            </Box>
        </Box>
        
        {/* Table Header */}
        <Box sx={{ display: 'flex', p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid', borderColor: 'divider' }}>
            <SkeletonItem variant="text" width="5%" sx={{ mr: 2 }} />
            <SkeletonItem variant="text" width="20%" sx={{ mr: 2 }} />
            <SkeletonItem variant="text" width="25%" sx={{ mr: 2 }} />
            <SkeletonItem variant="text" width="15%" sx={{ mr: 2 }} />
            <SkeletonItem variant="text" width="15%" sx={{ mr: 2 }} />
            <SkeletonItem variant="text" width="20%" />
        </Box>
        
        {/* Table Rows */}
        {Array.from({ length: count }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', p: 2, borderBottom: '1px solid', borderColor: 'divider', alignItems: 'center' }}>
                <SkeletonItem variant="circular" width={24} height={24} sx={{ mr: 2 }} />
                <SkeletonItem variant="text" width="20%" sx={{ mr: 2 }} />
                <SkeletonItem variant="text" width="25%" sx={{ mr: 2 }} />
                <SkeletonItem variant="rounded" width="12%" height={24} sx={{ mr: 2, borderRadius: 4 }} />
                <SkeletonItem variant="text" width="15%" sx={{ mr: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, justifyContent: 'flex-end' }}>
                    <SkeletonItem variant="circular" width={32} height={32} />
                    <SkeletonItem variant="circular" width={32} height={32} />
                </Box>
            </Box>
        ))}
        
        {/* Pagination */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <SkeletonItem variant="text" width={200} height={24} />
        </Box>
    </Paper>
);

const FormSkeleton = () => (
    <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, width: '100%', maxWidth: 800, mx: 'auto', mt: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
        <SkeletonItem variant="rounded" width="30%" height={36} sx={{ mb: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
            <SkeletonItem variant="rounded" height={56} />
            <SkeletonItem variant="rounded" height={56} />
            <SkeletonItem variant="rounded" height={56} />
            <SkeletonItem variant="rounded" height={56} />
            <SkeletonItem variant="rounded" height={120} sx={{ gridColumn: { sm: 'span 2' } }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <SkeletonItem variant="rounded" width={100} height={40} />
            <SkeletonItem variant="rounded" width={140} height={40} />
        </Box>
    </Paper>
);

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function CustomSkeleton({ type = 'card', count = 3 }: CustomSkeletonProps) {
    const loops = Array.from({ length: count });

    const renderSkeleton = () => {
        switch (type) {
            case 'dashboard':
                return <DashboardSkeleton />;

            case 'list':
                return (
                    <Stack spacing={2} direction="column" sx={{ width: '100%', mt: 2 }}>
                        {loops.map((_, i) => (
                            <Box key={i} sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2
                            }}>
                                <SkeletonItem variant="circular" width={40} height={40} />
                                <Box sx={{ flexGrow: 1 }}> {/* Đổi từ width cứng sang flexGrow để tự chiếm không gian */}
                                    <SkeletonItem variant="text" width="30%" sx={{ mb: 0.5 }} />
                                    <SkeletonItem variant="text" width="70%" />
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                );

            case 'form':
                return <FormSkeleton />;

            case 'table':
                return <TableSkeleton count={count} />;

            case 'home':
                return (
                    <Box sx={{ width: '100vw', ml: 'calc(50% - 50vw)' }}>
                        {/* Fake Hero Section */}
                        <Box
                            sx={{
                                background: (theme) =>
                                    `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                pt: 12,
                                pb: 20,
                                textAlign: 'center',
                            }}
                        >
                            <Container maxWidth="md">
                                <SkeletonItem variant="text" width="60%" height={60} sx={{ mx: 'auto', mb: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />
                                <SkeletonItem variant="text" width="80%" height={30} sx={{ mx: 'auto', mb: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
                                <SkeletonItem variant="text" width="50%" height={30} sx={{ mx: 'auto', mb: 6, bgcolor: 'rgba(255,255,255,0.2)' }} />
                                <SkeletonItem variant="rounded" width="100%" height={60} sx={{ mx: 'auto', maxWidth: 640, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.3)' }} />
                            </Container>
                        </Box>

                        {/* Fake Overlapping Cards */}
                        <Container maxWidth="lg" sx={{ mt: -8, mb: 10, position: 'relative', zIndex: 10 }}>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                                gap: 4
                            }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Paper key={i} sx={{ p: 4, borderRadius: 4, height: 260 }}>
                                        <SkeletonItem variant="circular" width={64} height={64} sx={{ mb: 3 }} />
                                        <SkeletonItem variant="text" width="70%" height={32} sx={{ mb: 2 }} />
                                        <SkeletonItem variant="text" width="100%" height={20} />
                                        <SkeletonItem variant="text" width="80%" height={20} sx={{ mb: 4 }} />
                                        <SkeletonItem variant="rounded" width={140} height={40} sx={{ borderRadius: 2 }} />
                                    </Paper>
                                ))}
                            </Box>
                        </Container>
                    </Box>
                );

            case 'page':
                return (
                    <Container maxWidth="md" sx={{ py: 8 }}>
                        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', minHeight: 600, borderColor: 'divider' }}>
                            <Box sx={{ bgcolor: 'rgba(0,0,0,0.03)', height: 140, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                                <SkeletonItem variant="text" width="50%" height={40} sx={{ mb: 1 }} />
                                <SkeletonItem variant="text" width="70%" height={24} />
                            </Box>
                            <Box sx={{ p: { xs: 3, md: 5 } }}>
                                <SkeletonItem variant="rounded" width="100%" height={60} sx={{ mb: 4, borderRadius: 2 }} />
                                <Stack spacing={3} direction="column">
                                    <SkeletonItem variant="rounded" width="100%" height={80} sx={{ borderRadius: 2 }} />
                                    <SkeletonItem variant="rounded" width="100%" height={80} sx={{ borderRadius: 2 }} />
                                </Stack>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                                    <SkeletonItem variant="rounded" width={120} height={42} sx={{ borderRadius: 1.5 }} />
                                    <SkeletonItem variant="rounded" width={140} height={42} sx={{ borderRadius: 1.5 }} />
                                </Box>
                            </Box>
                        </Paper>
                    </Container>
                );

            case 'card':
            default:
                return (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 3,
                        width: '100%',
                        maxWidth: 'lg',
                        mx: 'auto'
                    }}>
                        {loops.map((_, i) => (
                            <Paper key={i} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Box sx={{ flexGrow: 1, pr: 2 }}>
                                        <SkeletonItem variant="rounded" height={24} width="70%" sx={{ mb: 1 }} />
                                        <SkeletonItem variant="text" width="50%" />
                                    </Box>
                                    <SkeletonItem variant="circular" width={32} height={32} />
                                </Stack>
                                <SkeletonItem variant="rounded" height={6} sx={{ mb: 2, borderRadius: 3 }} />
                                <SkeletonItem variant="rounded" height={24} sx={{ mb: 1.5 }} />
                                <SkeletonItem variant="text" width="80%" sx={{ mb: 2 }} />
                                <SkeletonItem variant="rounded" height={42} />
                            </Paper>
                        ))}
                    </Box>
                );
        }
    };

    return (
        <Box sx={{ width: '100%', transition: 'opacity 0.3s ease-in-out' }}>
            {renderSkeleton()}
        </Box>
    );
}