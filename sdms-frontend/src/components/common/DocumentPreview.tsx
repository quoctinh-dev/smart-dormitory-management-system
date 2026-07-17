import { DownloadRounded, InsertDriveFileRounded, ZoomInRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';

interface DocumentPreviewProps {
  url?: string | null;
  title?: string;
  compact?: boolean;
}

function normalizeDocumentUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

function getDocumentKind(url?: string | null) {
  if (!url) return 'unknown';
  const normalized = url.toLowerCase();
  if (
    normalized.includes('/image/upload/') ||
    /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif|ico)(\?.*)?$/.test(normalized)
  ) {
    return 'image';
  }
  if (
    normalized.includes('/raw/upload/') ||
    normalized.includes('/pdf') ||
    /\.pdf(\?.*)?$/.test(normalized)
  ) {
    return 'pdf';
  }
  return 'other';
}

export default function DocumentPreview({
  url,
  title = 'Tài liệu đính kèm',
  compact = false,
}: DocumentPreviewProps) {
  const resolvedUrl = normalizeDocumentUrl(url);
  const kind = getDocumentKind(resolvedUrl);
  const [openPreview, setOpenPreview] = useState(false);

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (kind === 'pdf' && resolvedUrl) {
      setLoadingPdf(true);
      setPreviewError(false);
      fetch(resolvedUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.blob();
        })
        .then((blob) => {
          const objUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          setPdfBlobUrl(objUrl);
          setLoadingPdf(false);
        })
        .catch((err) => {
          console.error('Lỗi tải bản xem trước PDF (có thể do CORS hoặc file lỗi):', err);
          setPreviewError(true);
          setLoadingPdf(false);
        });
    }
  }, [kind, resolvedUrl]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl && pdfBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  if (!resolvedUrl) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          borderStyle: 'dashed',
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        <Typography variant="body2">Không có tài liệu để xem trước.</Typography>
      </Paper>
    );
  }

  if (kind === 'image') {
    return (
      <Box>
        <Box
          sx={{
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            cursor: 'zoom-in',
          }}
          onClick={() => setOpenPreview(true)}
        >
          <img
            src={resolvedUrl}
            alt={title}
            style={{
              width: '100%',
              maxHeight: compact ? 260 : 360,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </Box>

        <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
          <DialogContent dividers sx={{ p: 0, bgcolor: 'grey.100' }}>
            <img src={resolvedUrl} alt={title} style={{ width: '100%', display: 'block' }} />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenPreview(false)}>Đóng</Button>
            <Button
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DownloadRounded />}
              variant="contained"
            >
              Tải xuống
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  if (kind === 'pdf') {
    return (
      <Box>
        <Paper
          variant="outlined"
          sx={{ borderRadius: 2.5, overflow: 'hidden', bgcolor: 'background.paper' }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1.2}
            sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="PDF" color="primary" size="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                startIcon={<ZoomInRounded />}
                variant="outlined"
                size="small"
                onClick={() => setOpenPreview(true)}
              >
                Xem toàn màn hình
              </Button>
              <Button
                href={pdfBlobUrl || resolvedUrl}
                download={`${title}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<DownloadRounded />}
                variant="contained"
                size="small"
              >
                Tải tài liệu PDF
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
          <DialogContent
            dividers
            sx={{
              p: 0,
              bgcolor: 'grey.100',
              minHeight: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loadingPdf ? (
              <CircularProgress size={50} />
            ) : previewError ? (
              <Stack alignItems="center" spacing={2}>
                <Typography variant="body1" color="error">
                  Không thể xem trước tệp tin trực tuyến.
                </Typography>
                <Button
                  href={resolvedUrl}
                  download={`${title}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  startIcon={<DownloadRounded />}
                >
                  Tải xuống PDF
                </Button>
              </Stack>
            ) : (
              <iframe
                src={pdfBlobUrl || ''}
                title={title}
                width="100%"
                height="780px"
                style={{ border: 'none' }}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenPreview(false)}>Đóng</Button>
            <Button
              href={pdfBlobUrl || resolvedUrl}
              download={`${title}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DownloadRounded />}
              variant="contained"
            >
              Tải xuống
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: 'background.paper' }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
        <InsertDriveFileRounded color="primary" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Stack>
      <Button
        href={resolvedUrl}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<DownloadRounded />}
      >
        Tải xuống
      </Button>
    </Paper>
  );
}
