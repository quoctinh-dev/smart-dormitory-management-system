// src/utils/snackbar.ts
import { useSnackbar, VariantType, SnackbarKey } from 'notistack';
import { useEffect, MutableRefObject, createRef } from 'react';
import React from 'react';

// Define the shape of the snackbar utility functions
interface SnackbarUtils {
  enqueueSnackbar: (message: string, options?: { variant?: VariantType }) => SnackbarKey;
  closeSnackbar: (key?: SnackbarKey) => void;
}

// Initialize snackbarRef with placeholder functions that match the type
export const snackbarRef: MutableRefObject<SnackbarUtils | null> = createRef();

// This check is for environments where the ref might not be immediately available.
if (!snackbarRef.current) {
  snackbarRef.current = {
    enqueueSnackbar: (message: string, options?: { variant?: VariantType }) => {
      console.warn('enqueueSnackbar not yet initialized.', message, options);
      return ''; // Return a dummy key
    },
    closeSnackbar: (key?: SnackbarKey) => console.warn('closeSnackbar not yet initialized.', key),
  };
}

// This component will be rendered once in App.tsx to "attach" the useSnackbar functions to the ref
export const SnackbarUtilsConfigurator: React.FC = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    // Assign the actual functions from useSnackbar to the ref
    if (snackbarRef.current) {
      snackbarRef.current.enqueueSnackbar = enqueueSnackbar;
      snackbarRef.current.closeSnackbar = closeSnackbar;
    }
  }, [enqueueSnackbar, closeSnackbar]);

  return null; // This component does not render anything
};

// Utility object to call snackbars from anywhere in the application
export const snackbar = {
  success(msg: string) {
    this.show(msg, 'success');
  },
  error(msg: string) {
    this.show(msg, 'error');
  },
  info(msg: string) {
    this.show(msg, 'info');
  },
  warning(msg: string) {
    this.show(msg, 'warning');
  },
  show(msg: string, variant: VariantType = 'default') {
    if (snackbarRef.current) {
      snackbarRef.current.enqueueSnackbar(msg, { variant });
    }
  },
};
