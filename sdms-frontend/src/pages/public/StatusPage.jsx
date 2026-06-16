import { Container, Paper, Fade, Box } from "@mui/material";
import { useApplicationStatus } from "@/hooks/useApplicationStatus";
import { useState } from "react";
import CustomSkeleton from "@/components/CustomSkeleton";

export default function StatusPage() {
    const [cccd, setCccd] = useState('');
    const { application, documents, loading, error, fetchStatus } = useApplicationStatus();

    // Giả định currentPeriod lấy từ context hoặc store
    const handleSearch = () => fetchStatus(cccd, window.currentPeriod?.id);

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper> {/* Sử dụng Paper chuẩn từ Theme */}
                <StatusHeader />

                <Box sx={{ p: { xs: 3, md: 6 } }}>
                    <SearchForm 
                        value={cccd} 
                        onChange={setCccd} 
                        onSearch={handleSearch} 
                        loading={loading} 
                    />

                    {error && <ErrorMessage message={error} />}

                    {/* Logic hiển thị: Skeleton cho trạng thái chờ, Content cho trạng thái có dữ liệu */}
                    {loading ? (
                        <CustomSkeleton type="list" count={3} />
                    ) : application ? (
                        <Fade in>
                            <Box>
                                <TimelineSection status={application.status} />
                                <InfoGrid application={application} />
                                <DocumentList documents={documents} />
                            </Box>
                        </Fade>
                    ) : null}
                </Box>
            </Paper>
        </Container>
    );
}