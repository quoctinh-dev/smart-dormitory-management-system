import { Box, Typography, Alert } from "@mui/material";
import { CheckCircle, CloudUpload } from '@mui/icons-material';

const DOC_TYPES = [
    { type: 'CCCD_FRONT', label: 'Mặt trước CCCD', desc: 'Bản gốc hoặc bản sao y có công chứng' },
    { type: 'CCCD_BACK', label: 'Mặt sau CCCD', desc: 'Rõ nét, không bị mờ hoặc cắt góc' },
    { type: 'PORTRAIT_PHOTO', label: 'Ảnh chân dung 3x4', desc: 'Ảnh chụp không quá 6 tháng, rõ mặt' }
];

const PRIORITY_DOC_MAP = {
    PRIORITY_01: { type: 'PRIORITY_01_PROOF', label: 'Minh chứng Liệt sĩ/Thương binh', desc: 'Bản sao y có công chứng' },
    PRIORITY_02: { type: 'PRIORITY_02_PROOF', label: 'Minh chứng Chất độc hóa học', desc: 'Giấy chứng nhận y tế' },
    PRIORITY_03: { type: 'PRIORITY_03_PROOF', label: 'Minh chứng Dân tộc thiểu số', desc: 'Giấy khai sinh / Hộ khẩu' },
    PRIORITY_04: { type: 'PRIORITY_04_PROOF', label: 'Minh chứng Hộ nghèo/Khó khăn', desc: 'Sổ hộ nghèo/Giấy chứng nhận' },
    PRIORITY_05: { type: 'PRIORITY_05_PROOF', label: 'Minh chứng Khuyết tật/Mồ côi', desc: 'Giấy xác nhận địa phương' },
    PRIORITY_06: { type: 'PRIORITY_06_PROOF', label: 'Minh chứng Đảng viên/Xuất ngũ', desc: 'Thẻ Đảng / Quyết định' },
    PRIORITY_07: { type: 'PRIORITY_07_PROOF', label: 'Minh chứng CTXH', desc: 'Giấy khen / Chứng nhận' }
};

export default function DocumentUploadSection({ error, uploadedDocs, handleUpload, loading, formData }) {
    const extraDocs = (formData?.priorityCategories || []).filter(p => p !== 'NONE' && PRIORITY_DOC_MAP[p]).map(p => PRIORITY_DOC_MAP[p]);

    const renderDocBox = (doc) => (
        <Box 
            key={doc.type}
            sx={{ 
                border: uploadedDocs[doc.type] ? '2px solid #22c55e' : '2px dashed #cbd5e1', 
                borderRadius: 4, 
                p: 3, 
                textAlign: 'center',
                cursor: loading ? 'not-allowed' : 'pointer',
                bgcolor: uploadedDocs[doc.type] ? '#f0fdf4' : 'background.default',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                    bgcolor: loading ? undefined : '#f1f5f9',
                    transform: loading ? 'none' : 'translateY(-4px)',
                    boxShadow: loading ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                },
                position: 'relative'
            }}
            component="label"
        >
            <input 
                type="file" 
                hidden 
                onChange={(e) => e.target.files?.[0] && handleUpload(doc.type, e.target.files[0])} 
                disabled={loading}
            />
            {uploadedDocs[doc.type] ? (
                <>
                    <CheckCircle sx={{ fontSize: 40, color: '#22c55e', mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                        Đã tải lên
                    </Typography>
                    <Typography variant="caption" noWrap display="block" color="text.secondary" sx={{ mt: 1 }}>
                        {uploadedDocs[doc.type]}
                    </Typography>
                </>
            ) : (
                <>
                    <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 1, opacity: 0.8 }} />
                    <Typography variant="subtitle2" fontWeight="bold">{doc.label}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        {doc.desc}
                    </Typography>
                </>
            )}
        </Box>
    );

    return (
        <Box display="flex" flexDirection="column" gap={3} maxWidth={600} mx="auto" mt={4}>
            <Typography variant="h6" textAlign="center" fontWeight="bold" mb={2}>
                Tải lên hồ sơ minh chứng
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                I. Tài liệu bắt buộc chung ({DOC_TYPES.length} loại)
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
                {DOC_TYPES.map(renderDocBox)}
            </Box>

            {extraDocs.length > 0 && (
                <>
                    <Typography variant="subtitle1" fontWeight="bold" mt={2} color="secondary.main">
                        II. Tài liệu minh chứng diện ưu tiên ({extraDocs.length} loại)
                    </Typography>
                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
                        {extraDocs.map(renderDocBox)}
                    </Box>
                </>
            )}
        </Box>
    );
}
