import SendIcon from '@mui/icons-material/Send';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import { notificationApi, NotificationDeliveryLog } from '@/api/notificationApi';
import { snackbar } from '@/utils/snackbar';

export default function NotificationHistory() {
  const [logs, setLogs] = useState<NotificationDeliveryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [openBroadcast, setOpenBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    targetAudience: 'ALL',
  });
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchLogs = async (nextPage: number, size: number) => {
    setLoading(true);
    try {
      const data = await notificationApi.getDeliveryLogs(nextPage, size);
      setLogs(data.content || []);
      setTotalElements(data.totalElements || 0);
      setError(null);
    } catch (requestError) {
      console.error(requestError);
      setError('Loi khi tai lich su thong bao');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleBroadcastSubmit = async () => {
    if (!broadcastForm.title || !broadcastForm.message) return;

    setBroadcasting(true);
    try {
      const result = await notificationApi.broadcastNotification(broadcastForm);
      setOpenBroadcast(false);
      setBroadcastForm({ title: '', message: '', targetAudience: 'ALL' });
      setPage(0);
      snackbar.success(`Da phat thong bao cho ${result.recipientCount} tai khoan.`);
      fetchLogs(0, rowsPerPage);
    } catch (requestError) {
      console.error(requestError);
      snackbar.error('Loi khi gui broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Lich Su Thong Bao (Admin)
        </Typography>
        <Button variant="contained" startIcon={<SendIcon />} onClick={() => setOpenBroadcast(true)}>
          Gui Thong Bao Broadcast
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2, borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Thoi Gian</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nguoi Nhan</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Kenh</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trang Thai</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Event ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Chi Tiet Loi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    Chua co lich su thong bao nao.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>{new Date(row.createdAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell>{row.recipient}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.channel}
                        size="small"
                        color={row.channel === 'EMAIL' ? 'info' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={
                          row.status === 'SENT'
                            ? 'success'
                            : row.status === 'FAILED'
                              ? 'error'
                              : 'warning'
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                      {row.eventId}
                    </TableCell>
                    <TableCell sx={{ color: 'error.main', fontSize: '0.85rem' }}>
                      {row.errorMessage || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="So dong:"
        />
      </Paper>

      <Dialog open={openBroadcast} onClose={() => setOpenBroadcast(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Gui Thong Bao Toan He Thong</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tieu de"
            fullWidth
            value={broadcastForm.title}
            onChange={(event) =>
              setBroadcastForm((prev) => ({ ...prev, title: event.target.value }))
            }
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Noi dung"
            fullWidth
            multiline
            rows={4}
            value={broadcastForm.message}
            onChange={(event) =>
              setBroadcastForm((prev) => ({ ...prev, message: event.target.value }))
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenBroadcast(false)}>Huy</Button>
          <Button
            onClick={handleBroadcastSubmit}
            variant="contained"
            disabled={broadcasting || !broadcastForm.title || !broadcastForm.message}
          >
            {broadcasting ? 'Dang gui...' : 'Phat Song'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
