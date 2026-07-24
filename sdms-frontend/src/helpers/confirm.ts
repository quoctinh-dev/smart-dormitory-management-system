import { ReactNode } from 'react';

export interface ConfirmOptions {
  title?: ReactNode;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

export let confirmDialog: ConfirmFunction = () => Promise.resolve(false);

export const registerConfirm = (fn: ConfirmFunction) => {
  confirmDialog = fn;
};
