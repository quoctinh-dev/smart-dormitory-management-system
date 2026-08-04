import { useState, useEffect, useCallback } from 'react';
import { adminMaintenanceApi } from '@/api/maintenance-api';
import type { MaintenanceResponse, MaintenanceStatus } from '@/types/maintenance';
import { snackbar } from '@/helpers/snackbar';

export const useMaintenanceAdmin = () => {
    const [data, setData] = useState<MaintenanceResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | ''>('');
    
    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminMaintenanceApi.getAllRequests({ 
                page, 
                size: rowsPerPage,
                status: statusFilter !== '' ? statusFilter : undefined
            });
            setData(res.content ?? []);
            setTotalElements(res.totalElements ?? 0);
        } catch {
            snackbar.error('Lỗi khi tải danh sách yêu cầu bảo trì');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, statusFilter]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const updateStatus = async (id: string, status: MaintenanceStatus) => {
        try {
            await adminMaintenanceApi.updateStatus(id, { status });
            snackbar.success('Cập nhật trạng thái thành công');
            fetchList();
        } catch (err: unknown) {
            snackbar.error((err as any)?.message || 'Lỗi khi cập nhật trạng thái');
        }
    };

    return {
        data,
        loading,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        totalElements,
        fetchList,
        updateStatus,
        statusFilter,
        setStatusFilter
    };
};
