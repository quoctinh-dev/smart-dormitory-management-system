import { Box, CircularProgress, Typography, keyframes, alpha } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';

export type SkeletonType = 'table' | 'form' | 'dashboard' | 'card' | 'list' | 'home' | 'page';

interface CustomSkeletonProps {
    type?: SkeletonType;
    count?: number;
}

const pulseAnimation = keyframes`
  0% {
    opacity: 0.4;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.4;
    transform: scale(0.95);
  }
`;

const floatAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0px);
  }
`;

export default function CustomSkeleton({ type = 'card', count = 3 }: CustomSkeletonProps) {
    const isFullPage = type === 'page' || type === 'home' || type === 'dashboard';

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: isFullPage ? '60vh' : 300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                transition: 'opacity 0.3s ease-in-out',
                bgcolor: isFullPage ? 'background.default' : 'transparent',
            }}
        >
            <Box 
                sx={{ 
                    position: 'relative', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    animation: `${floatAnimation} 3s ease-in-out infinite`,
                }}
            >
                {/* Vòng nền mờ (Background Track) */}
                <CircularProgress
                    size={80}
                    thickness={3}
                    variant="determinate"
                    value={100}
                    sx={{
                        color: (theme) => alpha(theme.palette.primary.main, 0.15),
                        position: 'absolute',
                    }}
                />
                
                {/* Vòng xoay chính (Foreground Spinner) */}
                <CircularProgress
                    size={80}
                    thickness={3}
                    disableShrink
                    sx={{
                        color: 'primary.main',
                        animationDuration: '1.2s',
                        position: 'absolute',
                        [`& .MuiCircularProgress-circle`]: {
                            strokeLinecap: 'round',
                        },
                    }}
                />
                
                {/* Icon Ký túc xá ở giữa */}
                <Box 
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        zIndex: 1,
                    }}
                >
                    <ApartmentIcon fontSize="medium" />
                </Box>
            </Box>

            {/* Chữ có hiệu ứng nhấp nháy Pulse + Gradient */}
            <Typography
                variant="button"
                sx={{
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: `${pulseAnimation} 2s infinite ease-in-out`,
                }}
            >
                Hệ thống đang xử lý...
            </Typography>
        </Box>
    );
}