import { createTheme, ThemeOptions, PaletteMode } from '@mui/material/styles';

// This function creates a theme based on the provided mode ('light' or 'dark')
export const createCustomTheme = (mode: PaletteMode): ThemeOptions =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light Mode Palette
            primary: {
              main: '#2563eb',
              light: '#60a5fa',
              dark: '#1e40af',
              contrastText: '#ffffff',
            },
            secondary: {
              main: '#059669',
              light: '#34d399',
              dark: '#065f46',
              contrastText: '#ffffff',
            },
            background: {
              default: '#f8fafc', // Light grey background
              paper: '#ffffff',
            },
            text: {
              primary: '#0f172a',
              secondary: '#475569',
            },
            divider: '#e2e8f0',
          }
        : {
            // Dark Mode Palette (Example)
            primary: {
              main: '#60a5fa',
              light: '#bfdbfe',
              dark: '#3b82f6',
              contrastText: '#0f172a',
            },
            secondary: {
              main: '#34d399',
              light: '#6ee7b7',
              dark: '#059669',
              contrastText: '#0f172a',
            },
            background: {
              default: '#0f172a', // Dark blue background
              paper: '#1e293b',
            },
            text: {
              primary: '#f1f5f9',
              secondary: '#94a3b8',
            },
            divider: '#334155',
          }),
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 900, letterSpacing: '-1.5px' },
      h2: { fontWeight: 800, letterSpacing: '-1px' },
      h3: { fontWeight: 800, letterSpacing: '-0.5px' },
      h4: { fontWeight: 700, letterSpacing: '-0.5px' },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.3px',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: 'none',
            transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transform: 'translateY(-1px)',
            },
          },
          sizeLarge: { padding: '12px 32px' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 24,
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 24 },
          elevation1: { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined', fullWidth: true },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': { borderRadius: 12 },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: '1px solid',
            boxShadow: '0 8px 20px -10px rgba(15, 23, 42, 0.18)',
            '& .MuiAlert-icon': {
              fontSize: '1.2rem',
            },
          },
          standardSuccess: {
            borderColor: '#86efac',
            backgroundColor: '#f0fdf4',
            color: '#166534',
          },
          standardError: {
            borderColor: '#fda4af',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
          },
          standardWarning: {
            borderColor: '#fdba74',
            backgroundColor: '#fff7ed',
            color: '#9a2c00',
          },
          standardInfo: {
            borderColor: '#93c5fd',
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
          },
          filledSuccess: {
            backgroundColor: '#2e7d32',
          },
          filledError: {
            backgroundColor: '#c62828',
          },
          filledWarning: {
            backgroundColor: '#ed6c02',
          },
          filledInfo: {
            backgroundColor: '#1565c0',
          },
        },
      },
    },
  });
