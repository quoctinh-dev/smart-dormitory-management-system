import { DownloadRounded, InsertDriveFileRounded, ZoomInRounded, EditRounded } from '@mui/icons-material';
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
    onEdit?: () => void;
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
                                            onEdit,
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
                    console.error('Lỗi tải bản xem trước PDF:', err);
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
                    borderRadius: 2,
                    borderStyle: 'dashed',
                    textAlign: 'center',
                    color: 'text.secondary',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                }}
            >
                <Typography variant="body2">Không có tài liệu để xem trước.</Typography>
                {onEdit && (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditRounded />}
                        onClick={onEdit}
                        disableElevation
                        sx={{ textTransform: 'none', borderRadius: 1.5 }}
                    >
                        Tải lên tài liệu
                    </Button>
                )}
            </Paper>
        );
    }

    if (kind === 'image') {
        return (
            <Box>
                <Box
                    sx={{
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Box sx={{ cursor: 'zoom-in' }} onClick={() => setOpenPreview(true)}>
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
                    {onEdit && (
                        <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', bgcolor: 'background.default' }}>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditRounded />}
                                onClick={onEdit}
                                disableElevation
                                sx={{ textTransform: 'none', borderRadius: 1.5 }}
                            >
                                Đổi tài liệu khác
                            </Button>
                        </Box>
                    )}
                </Box>

                <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="lg" fullWidth>
                    <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{title}</span>
                        {onEdit && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditRounded />}
                                onClick={() => {
                                    setOpenPreview(false);
                                    onEdit();
                                }}
                                disableElevation
                                sx={{ textTransform: 'none', borderRadius: 1.5 }}
                            >
                                Thay đổi tài liệu
                            </Button>
                        )}
                    </DialogTitle>
                    <DialogContent dividers sx={{ p: 0, bgcolor: 'grey.100', display: 'flex', justifyContent: 'center' }}>
                        <img src={resolvedUrl} alt={title} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }} />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenPreview(false)} disableElevation sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                            Đóng
                        </Button>
                        <Button
                            href={resolvedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<DownloadRounded />}
                            variant="contained"
                            disableElevation
                            sx={{ textTransform: 'none', borderRadius: 1.5 }}
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
                    sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}
                >
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={1.2}
                        sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label="PDF" color="primary" size="small" sx={{ borderRadius: 1 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {title}
                            </Typography>
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            {onEdit && (
                                <Button
                                    startIcon={<EditRounded />}
                                    variant="outlined"
                                    size="small"
                                    onClick={onEdit}
                                    disableElevation
                                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                                >
                                    Thay đổi
                                </Button>
                            )}
                            <Button
                                startIcon={<ZoomInRounded />}
                                variant="outlined"
                                size="small"
                                onClick={() => setOpenPreview(true)}
                                disableElevation
                                sx={{ textTransform: 'none', borderRadius: 1.5 }}
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
                                disableElevation
                                sx={{ textTransform: 'none', borderRadius: 1.5 }}
                            >
                                Tải tài liệu PDF
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>

                <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { height: '85vh' } }}>
                    <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{title}</span>
                        {onEdit && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditRounded />}
                                onClick={() => {
                                    setOpenPreview(false);
                                    onEdit();
                                }}
                                disableElevation
                                sx={{ textTransform: 'none', borderRadius: 1.5 }}
                            >
                                Thay đổi tài liệu
                            </Button>
                        )}
                    </DialogTitle>
                    <DialogContent
                        dividers
                        sx={{
                            p: 0,
                            bgcolor: 'grey.100',
                            display: 'flex',
                            flexDirection: 'column',
                            flexGrow: 1,
                            overflow: 'hidden',
                        }}
                    >
                        {loadingPdf ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress size={50} />
                            </Box>
                        ) : previewError ? (
                            <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ height: '100%', p: 4 }}>
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
                                    disableElevation
                                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                                >
                                    Tải xuống PDF
                                </Button>
                            </Stack>
                        ) : (
                            <iframe
                                src={pdfBlobUrl || ''}
                                title={title}
                                width="100%"
                                height="100%"
                                style={{ border: 'none', flexGrow: 1 }}
                            />
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenPreview(false)} disableElevation sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                            Đóng
                        </Button>
                        <Button
                            href={pdfBlobUrl || resolvedUrl}
                            download={`${title}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<DownloadRounded />}
                            variant="contained"
                            disableElevation
                            sx={{ textTransform: 'none', borderRadius: 1.5 }}
                        >
                            Tải xuống
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }

    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <InsertDriveFileRounded color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {title}
                </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
                {onEdit && (
                    <Button
                        startIcon={<EditRounded />}
                        variant="outlined"
                        size="small"
                        onClick={onEdit}
                        disableElevation
                        sx={{ textTransform: 'none', borderRadius: 1.5 }}
                    >
                        Thay đổi
                    </Button>
                )}
                <Button
                    href={resolvedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<DownloadRounded />}
                    variant="outlined"
                    size="small"
                    disableElevation
                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                    Tải xuống
                </Button>
            </Stack>
        </Paper>
    );
}