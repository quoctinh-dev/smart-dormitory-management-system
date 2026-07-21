import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { UploadFile as UploadFileIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';

import gateApi from '@/api/gate-api';
import roomApi from '@/api/room-api';
import { snackbar } from '@/helpers/snackbar';
import type { GateRequest } from '@/types/gate';

interface GateImportPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  importRows: any[];
  setImportRows: (rows: any[]) => void;
  onSuccess: () => void;
}

export default function GateImportPreviewDialog({
  open,
  onClose,
  importRows,
  setImportRows,
  onSuccess,
}: GateImportPreviewDialogProps) {
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const [importDone, setImportDone] = useState(false);

  const handleImportConfirm = async () => {
    // Chỉ import các dòng hợp lệ
    const validRows = importRows.filter((r) => r._errors.length === 0);
    if (validRows.length === 0) {
      snackbar.error('Không có dòng hợp lệ nào để import');
      return;
    }

    setImportProgress(0);
    const updatedRows = [...importRows];

    // Lấy toàn bộ phòng 1 lần trước khi loop nếu có dòng ROOM_DOOR
    const needsRoomLookup = validRows.some((r) => r.gateType === 'ROOM_DOOR');
    let allRooms: any[] = [];
    if (needsRoomLookup) {
      const allRoomsRes = await roomApi.searchRooms({ size: 1000 }).catch(() => null);
      allRooms = (allRoomsRes as any)?.content || [];
    }

    for (let i = 0; i < updatedRows.length; i++) {
      const row = updatedRows[i];
      if (row._errors.length > 0) {
        row._status = 'error';
        row._message = row._errors.join(', ');
        continue;
      }

      try {
        // Tìm roomId từ roomCode nếu là ROOM_DOOR
        let roomId: string | undefined;
        if (row.gateType === 'ROOM_DOOR' && row.roomCode) {
          const foundRoom = allRooms.find(
            (r) => String(r.roomCode).trim() === String(row.roomCode).trim()
          );
          if (!foundRoom) {
            row._status = 'error';
            row._message = `Không tìm thấy phòng mã "${row.roomCode}"`;
            updatedRows[i] = { ...row };
            setImportRows([...updatedRows]);
            setImportProgress(Math.round(((i + 1) / updatedRows.length) * 100));
            continue;
          }
          roomId = foundRoom.roomId;
        }

        await gateApi.createGate({
          name: row.name,
          gateType: row.gateType,
          roomId: roomId,
          macAddress: row.macAddress || undefined,
          active: row.active,
        } as GateRequest);

        row._status = 'success';
        row._message = 'Thêm thành công';
      } catch (err: any) {
        row._status = 'error';
        row._message = err?.response?.data?.message || 'Lỗi khi tạo cổng';
      }

      updatedRows[i] = { ...row };
      setImportRows([...updatedRows]);
      setImportProgress(Math.round(((i + 1) / updatedRows.length) * 100));
    }

    setImportDone(true);
    onSuccess();
    const successCount = updatedRows.filter((r) => r._status === 'success').length;
    const errorCount = updatedRows.filter((r) => r._status === 'error').length;
    snackbar.success(`Import hoàn tất: ${successCount} thành công, ${errorCount} thất bại`);
  };

  const handleClose = () => {
    if (importProgress !== null && !importDone) return;
    setImportProgress(null);
    setImportDone(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        📋 Preview Import Excel — {importRows.length} dòng
      </DialogTitle>
      <DialogContent dividers>
        {importProgress !== null && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={importProgress}
              sx={{ borderRadius: 2, height: 8 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Đang import... {importProgress}%
            </Typography>
          </Box>
        )}
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Dòng</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tên cổng</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Loại</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mã phòng</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>MAC</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {importRows.map((row, idx) => (
                <TableRow
                  key={idx}
                  sx={{
                    bgcolor:
                      row._status === 'success'
                        ? (theme) => alpha(theme.palette.success.main, 0.06)
                        : row._status === 'error' || row._errors.length > 0
                        ? (theme) => alpha(theme.palette.error.main, 0.06)
                        : 'inherit',
                  }}
                >
                  <TableCell>{row._row}</TableCell>
                  <TableCell>
                    {row.name || (
                      <Typography color="error" variant="caption">
                        Trống
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.gateType}
                      size="small"
                      color={row.gateType === 'ROOM_DOOR' ? 'info' : 'primary'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{row.roomCode || '—'}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {row.macAddress || '—'}
                  </TableCell>
                  <TableCell>
                    {row._status === 'success' ? (
                      <Chip label="✅ Thành công" size="small" color="success" />
                    ) : row._status === 'error' ? (
                      <Chip
                        label={`❌ ${row._message}`}
                        size="small"
                        color="error"
                        sx={{ maxWidth: 200 }}
                      />
                    ) : row._errors.length > 0 ? (
                      <Chip
                        label={`⚠️ ${row._errors.join(', ')}`}
                        size="small"
                        color="warning"
                        sx={{ maxWidth: 200 }}
                      />
                    ) : (
                      <Chip label="⏳ Chờ import" size="small" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {importRows.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Chip
              label={`✅ Hợp lệ: ${importRows.filter((r) => r._errors.length === 0).length}`}
              color="success"
              size="small"
            />
            <Chip
              label={`⚠️ Lỗi validate: ${importRows.filter((r) => r._errors.length > 0).length}`}
              color="warning"
              size="small"
            />
            {importDone && (
              <Chip
                label={`🎉 Đã import: ${importRows.filter((r) => r._status === 'success').length}`}
                color="info"
                size="small"
              />
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={importProgress !== null && !importDone}>
          {importDone ? 'Đóng' : 'Hủy'}
        </Button>
        {!importDone && (
          <Button
            variant="contained"
            color="success"
            onClick={handleImportConfirm}
            disabled={
              importProgress !== null || importRows.filter((r) => r._errors.length === 0).length === 0
            }
            startIcon={<UploadFileIcon />}
          >
            Import {importRows.filter((r) => r._errors.length === 0).length} dòng hợp lệ
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
