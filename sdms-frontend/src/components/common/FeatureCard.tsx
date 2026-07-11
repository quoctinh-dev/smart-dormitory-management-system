import { Card, Box, Typography, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

/**
 * FeatureCard: Component dùng chung cho các khối chức năng (Trang chủ, Dashboard...)
 */
export default function FeatureCard({
  icon,
  title,
  description,
  buttonText,
  to,
  variant = 'contained',
  color = 'primary',
}: any) {
  return (
    <Card
      sx={{
        p: 4,
        borderRadius: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: (theme) =>
            `0 16px 32px -12px ${alpha((theme.palette as any)[color].main, 0.28)}`,
        },
      }}
    >
      <Box
        sx={(theme) => ({
          mb: 2.5,
          width: 60,
          height: 60,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha((theme.palette as any)[color].main, 0.1),
          color: (theme.palette as any)[color].main,
          mx: 'auto',
        })}
      >
        {icon}
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }} gutterBottom>
        {title}
      </Typography>

      <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 4, flexGrow: 1, lineHeight: 1.7 }}>
        {description}
      </Typography>

      {buttonText && to && (
        <Button
          fullWidth
          color={color as any}
          variant={variant as any}
          size="large"
          component={RouterLink}
          to={to}
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          {buttonText}
        </Button>
      )}
    </Card>
  );
}
