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
            variant="outlined"
            sx={{
                p: 3,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            <Typography
                variant="subtitle2"
                sx={{
                    fontWeight: 700,
                    mb: 2,
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
                    width: 44,
                    height: 44,
                    bgcolor: alpha(theme.palette[color].main, 0.1),
                    color: `${color}.main`,
                    borderRadius: 1.5,
                    mb: 1.5,
                    '& svg': { fontSize: 24 },
                })}
            >
                {icon}
            </Avatar>

            <Typography variant="h4" sx={{ fontWeight: 700, mb: actionLink ? 2 : 0, color: 'text.primary' }}>
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
                    Chi tiết{' '}
                    <Link
                        href={actionLink.url}
                        sx={{
                            color: `${color}.main`,
                            textDecoration: 'none',
                            fontWeight: 600,
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        {actionLink.text}
                    </Link>
                </Typography>
            )}
        </Card>
    );
}