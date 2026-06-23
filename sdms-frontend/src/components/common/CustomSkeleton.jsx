import { Box, Skeleton, Stack, Paper } from '@mui/material';

const SkeletonItem = (props) => (
  <Skeleton animation="wave" sx={{ bgcolor: 'grey.200' }} {...props} />
);

export default function CustomSkeleton({ type = 'card', count = 3 }) {
  const loops = Array.from({ length: count });

  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return (
          <Box sx={{ pt: 2 }}>
            <SkeletonItem variant="text" width="40%" height={60} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {loops.map((_, i) => (
                <Paper key={i} sx={{ p: 3, flex: '1 1 300px' }}>
                  <SkeletonItem variant="text" width="60%" />
                  <SkeletonItem variant="rectangular" height={60} sx={{ mt: 2, borderRadius: 2 }} />
                </Paper>
              ))}
            </Box>
          </Box>
        );

      case 'list':
        return (
          <Stack spacing={2} sx={{ width: '100%', mt: 2 }}>
            {loops.map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SkeletonItem variant="circular" width={40} height={40} />
                <Box sx={{ flexGrow: 1 }}>
                  <SkeletonItem variant="text" width="30%" />
                  <SkeletonItem variant="text" width="80%" />
                </Box>
              </Box>
            ))}
          </Stack>
        );

      case 'form':
        return (
          <Paper sx={{ p: 4, width: '100%', maxWidth: 600, mx: 'auto', mt: 4 }}>
            <SkeletonItem variant="text" width="50%" height={40} sx={{ mb: 4, mx: 'auto' }} />
            <Stack spacing={3}>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonItem key={i} variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                <SkeletonItem variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
                <SkeletonItem variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
              </Box>
            </Stack>
          </Paper>
        );

      case 'card':
      default:
        return (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            {loops.map((_, i) => (
              <Paper key={i} sx={{ p: 4, width: '100%', maxWidth: 350 }}>
                <SkeletonItem variant="circular" width={60} height={60} sx={{ mb: 2, mx: 'auto' }} />
                <SkeletonItem variant="text" height={40} sx={{ mb: 1 }} />
                <SkeletonItem variant="text" />
                <SkeletonItem variant="text" width="80%" />
                <SkeletonItem variant="rectangular" height={48} sx={{ mt: 3, borderRadius: 2 }} />
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