// src/utils/snackbar.ts
import { useSnackbar, VariantType, SnackbarKey } from 'notistack';
import { useEffect, MutableRefObject, createRef } from 'react';
import React from 'react';

interface SnackbarUtils {
  enqueueSnackbar: (
      message: string,
      options?: { variant?: VariantType; autoHideDuration?: number; anchorOrigin?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'center' | 'right' } }
  ) => SnackbarKey;
  closeSnackbar: (key?: SnackbarKey) => void;
}

export const snackbarRef: MutableRefObject<SnackbarUtils | null> = createRef();

if (!snackbarRef.current) {
  snackbarRef.current = {
    enqueueSnackbar: (message: string, options) => {
      console.warn('enqueueSnackbar not yet initialized.', message, options);
      return '';
    },
    closeSnackbar: (key?: SnackbarKey) => console.warn('closeSnackbar not yet initialized.', key),
  };
}

export const SnackbarUtilsConfigurator: React.FC = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    // Assign the actual functions from useSnackbar to the ref
    if (snackbarRef.current) {
      snackbarRef.current.enqueueSnackbar = enqueueSnackbar;
      snackbarRef.current.closeSnackbar = closeSnackbar;
    }
  }, [enqueueSnackbar, closeSnackbar]);

  return null;
};

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
      snackbarRef.current.enqueueSnackbar(msg, {
        variant,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        autoHideDuration: 3000,
      });
    }
  },
};