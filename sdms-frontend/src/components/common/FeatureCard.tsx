import { Card, Box, Typography, Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

type PaletteColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
type ButtonVariant = ButtonProps['variant'];

/**
 * FeatureCard: Component dùng chung cho các khối chức năng (Trang chủ, Dashboard...)
 */
interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  to?: string;
  variant?: ButtonVariant;
  color?: PaletteColor;
}

export default function FeatureCard({
  icon,
  title,
  description,
  buttonText,
  to,
  variant = 'contained',
  color = 'primary',
}: FeatureCardProps) {
  return (
    <Card
      sx={{
        p: 4,
        borderRadius: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <Box
        sx={(theme) => ({
          mb: 2.5,
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette[color].main, 0.1),
          color: theme.palette[color].main,
          mx: 'auto',
          borderRadius: 2,
        })}
      >
        {icon}
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }} gutterBottom>
        {title}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ textAlign: 'center', mb: 4, flexGrow: 1, lineHeight: 1.7 }}
      >
        {description}
      </Typography>

      {buttonText && to && (
        <Button
          fullWidth
          color={color}
          variant={variant}
          size="large"
          component={RouterLink}
          to={to}
          sx={{ fontWeight: 'bold' }}
        >
          {buttonText}
        </Button>
      )}
    </Card>
  );
}
