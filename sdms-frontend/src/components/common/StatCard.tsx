import { Box, Card, Typography, Avatar, Link } from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  actionLink?: {
    text: string;
    url: string;
  };
}

export default function StatCard({ title, value, icon, color = 'primary', actionLink }: StatCardProps) {
  return (
    <Card
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: (theme) => `0px 4px 20px ${alpha(theme.palette[color].main, 0.05)}`,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          mb: 3,
          color: 'text.secondary',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Typography>

      <Avatar
        variant="rounded"
        sx={(theme) => ({
          width: 52,
          height: 52,
          bgcolor: alpha(theme.palette[color].main, 0.1),
          color: `${color}.main`,
          borderRadius: 3,
          mb: 2,
          '& svg': { fontSize: 28 },
        })}
      >
        {icon}
      </Avatar>

      <Typography variant="h4" sx={{ fontWeight: 600, mb: actionLink ? 3 : 1, color: 'text.primary' }}>
        {value}
      </Typography>

      {actionLink && (
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            display: 'flex',
            gap: 0.5,
            flexWrap: 'wrap',
            mt: 'auto',
          }}
        >
          Chi tiết 
          <Link href={actionLink.url} sx={{ color: `${color}.main`, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            {actionLink.text}
          </Link>
        </Typography>
      )}
    </Card>
  );
}
