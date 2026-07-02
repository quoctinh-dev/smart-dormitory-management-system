import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '@/auth';
import AppRouter from '@/routes';
import { createCustomTheme } from '@/theme';
import { SnackbarUtilsConfigurator } from '@/utils/snackbar';

const App: React.FC = () => {
  // Creating the theme instance. The type is inferred but can be explicitly stated as Theme.
  const theme = createCustomTheme('light'); // Or 'dark' based on user preference

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={3000}
      >
        <SnackbarUtilsConfigurator />
        <BrowserRouter>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
