import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { IconifyIcon } from '@/components/base/IconifyIcon';

const DOC_TYPES = [
  {
    type: 'PORTRAIT_PHOTO',
    label: 'Ảnh chân dung 3x4',
    desc: 'Ảnh chụp không quá 6 tháng, rõ mặt',
  },
  {
    type: 'STUDENT_CARD',
    label: 'Thẻ Sinh viên',
    desc: 'Ảnh mặt trước Thẻ Sinh viên (Nếu có)',
  },
  {
    type: 'CCCD_FRONT',
    label: 'CCCD Mặt trước',
    desc: 'Ảnh chụp rõ nét, không lóa sáng',
  },
  {
    type: 'CCCD_BACK',
    label: 'CCCD Mặt sau',
    desc: 'Ảnh chụp rõ nét, không lóa sáng',
  },
];

const PRIORITY_DOC_MAP: Record<string, { type: string; label: string; desc: string }> = {
  PRIORITY_01: {
    type: 'PRIORITY_01_PROOF',
    label: 'Minh chứng Liệt sĩ/Thương binh',
    desc: 'Bản sao y có công chứng',
  },
  PRIORITY_02: {
    type: 'PRIORITY_02_PROOF',
    label: 'Minh chứng Chất độc hóa học',
    desc: 'Giấy chứng nhận y tế',
  },
  PRIORITY_03: {
    type: 'PRIORITY_03_PROOF',
    label: 'Minh chứng Dân tộc thiểu số',
    desc: 'Giấy khẳng định / Hộ khẩu',
  },
  PRIORITY_04: {
    type: 'PRIORITY_04_PROOF',
    label: 'Minh chứng Hộ nghèo/Khó khăn',
    desc: 'Sổ hộ nghèo/Giấy chứng nhận',
  },
  PRIORITY_05: {
    type: 'PRIORITY_05_PROOF',
    label: 'Minh chứng Khuyết tật/Mồ côi',
    desc: 'Giấy xác nhận địa phương',
  },
  PRIORITY_06: {
    type: 'PRIORITY_06_PROOF',
    label: 'Minh chứng Đảng viên/Xuất ngũ',
    desc: 'Thẻ Đảng / Quyết định',
  },
  PRIORITY_07: {
    type: 'PRIORITY_07_PROOF',
    label: 'Minh chứng CTXH',
    desc: 'Giấy khen / Chứng nhận',
  },
};

interface DocumentUploadBoxProps {
  doc: { type: string; label: string; desc: string };
  isUploaded: boolean;
  uploadedName: string | null | undefined;
  previewUrl?: string;
  loading: boolean;
  onUpload: (type: string, file: File) => void;
}

const DocumentUploadBox = ({
  doc,
  isUploaded,
  uploadedName,
  previewUrl,
  loading,
  onUpload,
}: DocumentUploadBoxProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpload(doc.type, e.target.files[0]);
    }
  };

  return (
    <Box
      sx={{
        border: '2px dashed',
        borderColor: () => (isUploaded ? 'success.main' : 'divider'),
        borderStyle: isUploaded ? 'solid' : 'dashed',
        borderRadius: 4,
        p: 3,
        textAlign: 'center',
        cursor: loading ? 'not-allowed' : 'pointer',
        bgcolor: (theme) =>
          isUploaded ? alpha(theme.palette.success.main, 0.05) : 'background.default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          bgcolor: (theme) => (loading ? undefined : alpha(theme.palette.action.hover, 0.06)),
          transform: loading ? 'none' : 'translateY(-4px)',
          boxShadow: loading ? 'none' : (theme) => theme.shadows[4],
        },
        position: 'relative',
        minWidth: 0,
      }}
      component="label"
      title={isUploaded ? uploadedName || undefined : undefined}
    >
      <input type="file" hidden onChange={handleFileChange} disabled={loading} />
      {isUploaded ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {previewUrl ? (
            <Box
              component="img"
              src={previewUrl}
              alt={uploadedName || 'Preview'}
              sx={{
                width: '100%',
                maxHeight: 120,
                objectFit: 'contain',
                borderRadius: 2,
                mb: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          ) : (
            <IconifyIcon
              icon="mingcute:check-circle-fill"
              sx={{ fontSize: 40, color: 'success.main', mb: 1 }}
            />
          )}
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
            Đã tải lên
          </Typography>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{
              mt: 0.5,
              px: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            {uploadedName}
          </Typography>
        </Box>
      ) : (
        <>
          <IconifyIcon
            icon="mingcute:upload-fill"
            sx={{ fontSize: 40, color: 'primary.main', mb: 1, opacity: 0.8 }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {doc.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            {doc.desc}
          </Typography>
        </>
      )}
    </Box>
  );
};

// --- Main Component ---

import { IRegistrationFormData } from '@/hooks/useRegistration';

interface DocumentUploadSectionProps {
  uploadedDocs: Record<string, string | null>;
  uploadedPreviews: Record<string, string>;
  handleUpload: (type: string, file: File) => void;
  loading: boolean;
  formData: IRegistrationFormData;
  period: any;
  targetGroup: string;
}

export default function DocumentUploadSection({
  uploadedDocs,
  uploadedPreviews,
  handleUpload,
  loading,
  formData,
  period,
  targetGroup,
}: DocumentUploadSectionProps) {
  const extraDocs = (formData?.priorityCategories || [])
    .filter((p) => p !== 'NONE' && PRIORITY_DOC_MAP[p])
    .map((p) => PRIORITY_DOC_MAP[p]);

  const displayDocTypes = DOC_TYPES.filter((doc) => {
    if (doc.type === 'STUDENT_CARD' && (targetGroup === 'FRESHMAN' || period?.registrationType === 'NEW_STUDENT')) {
      return false;
    }
    return true;
  });

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto', mt: 4 }}
    >
      <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}>
        Tải lên hồ sơ minh chứng
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        I. Tài liệu bắt buộc chung ({displayDocTypes.length} loại)
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: displayDocTypes.length === 1 ? '1fr' : { xs: '1fr', sm: '1fr 1fr' },
          gap: 3,
          maxWidth: displayDocTypes.length === 1 ? 400 : '100%',
          mx: 'auto',
        }}
      >
        {displayDocTypes.map((doc) => (
          <DocumentUploadBox
            key={doc.type}
            doc={doc}
            isUploaded={!!uploadedDocs[doc.type]}
            uploadedName={uploadedDocs[doc.type]}
            previewUrl={uploadedPreviews?.[doc.type]}
            loading={loading}
            onUpload={handleUpload}
          />
        ))}
      </Box>

      {extraDocs.length > 0 && (
        <>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'bold', mt: 2, color: 'secondary.main' }}
          >
            II. Tài liệu minh chứng diện ưu tiên ({extraDocs.length} loại)
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: extraDocs.length === 1 ? '1fr' : { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
              maxWidth: extraDocs.length === 1 ? 400 : '100%',
              mx: 'auto',
            }}
          >
            {extraDocs.map((doc) => (
              <DocumentUploadBox
                key={doc.type}
                doc={doc}
                isUploaded={!!uploadedDocs[doc.type]}
                uploadedName={uploadedDocs[doc.type]}
                previewUrl={uploadedPreviews?.[doc.type]}
                loading={loading}
                onUpload={handleUpload}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
