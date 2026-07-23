import { Card, Box, Typography, Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

type PaletteColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
type ButtonVariant = ButtonProps['variant'];

/**
 * FeatureCard: Component dùng chung cho các khối chức năng (Trang chủ, Dashboard...)
 * Đã chuẩn hóa theo ngôn ngữ thiết kế Flat & Minimalist cho hệ thống SDMS.
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
            variant="outlined"
            sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
                '&:hover': {
                    borderColor: `${color}.main`,
                    bgcolor: (theme) => alpha(theme.palette[color].main, 0.02),
                },
            }}
        >
            {icon && (
                <Box
                    sx={(theme) => ({
                        mb: 2,
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette[color].main, 0.1),
                        color: `${color}.main`,
                        borderRadius: 1.5,
                        mx: 'auto',
                    })}
                >
                    {icon}
                </Box>
            )}

            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }} gutterBottom>
                {title}
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'center', mb: 3, flexGrow: 1, lineHeight: 1.6 }}
            >
                {description}
            </Typography>

            {buttonText && to && (
                <Button
                    fullWidth
                    color={color}
                    variant={variant}
                    size="medium"
                    component={RouterLink}
                    to={to}
                    disableElevation
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 1.5,
                    }}
                >
                    {buttonText}
                </Button>
            )}
        </Card>
    );
}