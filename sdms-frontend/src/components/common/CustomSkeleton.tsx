import { Skeleton } from '@mui/material';
import { Box, Stack, Paper } from '@mui/material';

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
        sx={{ bgcolor: 'grey.200', ...sx }}
    />
);

export type SkeletonType = 'dashboard' | 'list' | 'form' | 'card' | 'table';

interface CustomSkeletonProps {
  type?: SkeletonType;
  count?: number;
}

export default function CustomSkeleton({ type = 'card', count = 3 }: CustomSkeletonProps) {
  const loops = Array.from({ length: count });

  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return (
            <Box sx={{ pt: 2, width: '100%' }}>
              <SkeletonItem variant="text" width="30%" height={48} sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {loops.map((_, i) => (
                    <Paper key={i} variant="outlined" sx={{ p: 3, flex: '1 1 300px', borderRadius: 2 }}>
                      <SkeletonItem variant="text" width="50%" sx={{ mb: 1 }} />
                      <SkeletonItem variant="rectangular" height={60} sx={{ mt: 2, borderRadius: 1.5 }} />
                    </Paper>
                ))}
              </Box>
            </Box>
        );

      case 'list':
        return (
            <Stack spacing={2} sx={{ width: '100%', mt: 2 }}>
              {loops.map((_, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <SkeletonItem variant="circular" width={40} height={40} />
                    <Box sx={{ flexGrow: 1 }}>
                      <SkeletonItem variant="text" width="30%" sx={{ mb: 0.5 }} />
                      <SkeletonItem variant="text" width="70%" />
                    </Box>
                  </Box>
              ))}
            </Stack>
        );

      case 'form':
        return (
            <Paper variant="outlined" sx={{ p: 4, width: '100%', maxWidth: 600, mx: 'auto', mt: 4, borderRadius: 2 }}>
              <SkeletonItem variant="text" width="40%" height={36} sx={{ mb: 3, mx: 'auto' }} />
              <Stack spacing={2.5}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonItem key={i} variant="rectangular" height={52} sx={{ borderRadius: 1.5 }} />
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
                  <SkeletonItem
                      variant="rectangular"
                      width={90}
                      height={36}
                      sx={{ borderRadius: 1.5 }}
                  />
                  <SkeletonItem
                      variant="rectangular"
                      width={110}
                      height={36}
                      sx={{ borderRadius: 1.5 }}
                  />
                </Box>
              </Stack>
            </Paper>
        );

      case 'table':
        return (
            <Paper variant="outlined" sx={{ width: '100%', p: 3, borderRadius: 2, mt: 2 }}>
              <SkeletonItem variant="text" width="25%" height={32} sx={{ mb: 3 }} />
              <Stack spacing={2}>
                {loops.map((_, i) => (
                    <SkeletonItem key={i} variant="rectangular" height={44} sx={{ borderRadius: 1.5 }} />
                ))}
              </Stack>
            </Paper>
        );

      case 'card':
      default:
        return (
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'flex-start', width: '100%' }}>
              {loops.map((_, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 3, width: '100%', maxWidth: 350, borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box sx={{ width: '60%' }}>
                        <SkeletonItem variant="text" height={28} sx={{ mb: 0.5 }} />
                        <SkeletonItem variant="text" width="50%" />
                      </Box>
                      <SkeletonItem variant="circular" width={32} height={32} />
                    </Stack>
                    <SkeletonItem variant="rectangular" height={6} sx={{ mb: 2, borderRadius: 3 }} />
                    <SkeletonItem variant="text" height={24} sx={{ mb: 1 }} />
                    <SkeletonItem variant="text" width="80%" sx={{ mb: 2 }} />
                    <SkeletonItem variant="rectangular" height={42} sx={{ borderRadius: 1.5 }} />
                  </Paper>
              ))}
            </Box>
        );
    }
  };

  return (
      <Box sx={{ width: '100%', transition: 'opacity 0.3s ease-in-out' }}>{renderSkeleton()}</Box>
  );
}