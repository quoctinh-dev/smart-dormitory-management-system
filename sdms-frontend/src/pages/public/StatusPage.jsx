import { Container, Paper, Fade, Box, Typography, TextField, Button, Alert, InputAdornment } from "@mui/material";
import { useApplicationStatus } from "@/hooks/useApplicationStatus";
import { useState } from "react";
import CustomSkeleton from "@/components/CustomSkeleton";
import StatusIndicator from "./components/Status/StatusIndicator";
import AssignmentInfo from "./components/Status/AssignmentInfo";
import ApplicationInfo from "./components/Status/ApplicationInfo";

export default function StatusPage() {
    const [cccd, setCccd] = useState('');
    const { application, assignment, documents, loading, error, fetchStatus } = useApplicationStatus();

    const handleSearch = () => fetchStatus(cccd);

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Fade in timeout={800}>
                <Paper sx={{ borderRadius: 6, overflow: 'hidden' }}>
                    <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold">Tra cứu trạng thái hồ sơ</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>Nhập số CCCD/CMND để xem tiến độ duyệt hồ sơ của bạn</Typography>
                    </Box>

                    <Box sx={{ p: { xs: 3, md: 6 } }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                            <TextField 
                                fullWidth 
                                label="Số CCCD / CMND" 
                                variant="outlined" 
                                value={cccd}
                                onChange={(e) => setCccd(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button 
                                variant="contained" 
                                size="large" 
                                onClick={handleSearch}
                                disabled={loading || !cccd}
                                sx={{ minWidth: 120, borderRadius: 2 }}
                            >
                                {loading ? 'Đang tìm...' : 'Tra cứu'}
                            </Button>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                        {loading ? (
                            <CustomSkeleton type="list" count={3} />
                        ) : application ? (
                            <Fade in>
                                <Box>
                                    <StatusIndicator status={application.status} applicationId={application.applicationId} />
                                    <AssignmentInfo assignment={assignment} />
                                    <ApplicationInfo application={application} documents={documents} fetchStatus={fetchStatus} />
                                </Box>
                            </Fade>
                        ) : null}
                    </Box>
                </Paper>
            </Fade>
        </Container>
    );
}