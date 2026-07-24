import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';

import { registerConfirm, ConfirmOptions } from '@/helpers/confirm';

export default function GlobalConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((val: boolean) => void) | null>(null);

  useEffect(() => {
    registerConfirm((opts) => {
      setOptions(opts);
      setOpen(true);
      return new Promise<boolean>((resolve) => {
        setResolvePromise(() => resolve);
      });
    });
  }, []);

  const handleClose = (value: boolean) => {
    setOpen(false);
    if (resolvePromise) resolvePromise(value);
  };

  if (!options) return null;

  return (
    <Dialog 
        open={open} 
        onClose={() => handleClose(false)} 
        maxWidth="xs" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
         <WarningAmberIcon color={options.color || 'error'} />
         <Typography variant="h6" fontWeight={700}>{options.title || 'Xác nhận hành động'}</Typography>
      </DialogTitle>
      <DialogContent sx={{ pb: 3 }}>
        <Typography variant="body1" color="text.secondary">{options.message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: 'flex-end', gap: 1 }}>
        <Button 
            onClick={() => handleClose(false)} 
            color="inherit" 
            sx={{ fontWeight: 600, borderRadius: 2 }}
        >
            {options.cancelText || 'Hủy bỏ'}
        </Button>
        <Button 
            onClick={() => handleClose(true)} 
            variant="contained" 
            color={options.color || 'error'} 
            disableElevation 
            sx={{ fontWeight: 600, borderRadius: 2 }}
        >
            {options.confirmText || 'Đồng ý'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
