import { Button, Typography, Box, Paper } from '@mui/material';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        textAlign: 'center',
                        p: 3,
                        bgcolor: 'background.default',
                    }}
                >
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 4,
                            maxWidth: 480,
                            width: '100%',
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <Typography variant="h5" fontWeight={700} color="error" gutterBottom>
                            Oops! Đã có lỗi xảy ra.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, wordBreak: 'break-word' }}>
                            {this.state.error?.message || 'Không thể tải trang này.'}
                        </Typography>
                        <Button
                            variant="contained"
                            disableElevation
                            color="primary"
                            onClick={() => window.location.reload()}
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 3 }}
                        >
                            Tải Lại Trang
                        </Button>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;