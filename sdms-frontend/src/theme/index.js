import { createTheme } from '@mui/material';

const theme = createTheme({
    // 1. Quản lý hệ thống màu sắc (Color Palette)
    palette: {
        primary: {
            main: '#2563eb', // Xanh Portal
            light: '#60a5fa',
            dark: '#1e40af',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#059669', // Xanh lá
            light: '#34d399',
            dark: '#065f46',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
    },

    // 2. Quản lý khoảng cách (Breakpoints) cho responsive
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },

    // 3. Typography (Font chữ toàn cục)
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 900, letterSpacing: '-1.5px' },
        h2: { fontWeight: 800, letterSpacing: '-1px' },
        h3: { fontWeight: 800, letterSpacing: '-0.5px' },
        h4: { fontWeight: 700, letterSpacing: '-0.5px' },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.3px' },
    },

    // 4. Component Styles (Design System Core)
    components: {
        // Mặc định cho mọi Container
        MuiContainer: {
            defaultProps: { maxWidth: 'lg' },
        },
        // Mặc định cho Button
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '8px 24px',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
                },
                sizeLarge: { padding: '12px 32px' },
            },
        },
        // Mặc định cho Card
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 24,
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #f1f5f9',
                },
            },
        },
        // Mặc định cho Paper (Layout/Background)
        MuiPaper: {
            styleOverrides: {
                root: { borderRadius: 24 },
                elevation1: { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
            },
        },
        // Mặc định cho TextField
        MuiTextField: {
            defaultProps: { variant: 'outlined', fullWidth: true },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': { borderRadius: 12 },
                },
            },
        },
        // Mặc định cho Alert
        MuiAlert: {
            styleOverrides: { root: { borderRadius: 12 } },
        },
    },
});

export default theme;