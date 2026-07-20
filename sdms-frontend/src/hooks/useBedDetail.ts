import { useState, useEffect } from 'react';

import roomApi from '@/api/room-api';
import type { ActiveAssignmentResponse, BedResponse, BedStatus, RoomWithBeds } from '@/types/room';

export const useBedDetail = (
  open: boolean,
  bed: BedResponse | null,
  room: RoomWithBeds | null,
  onClose: () => void,
  onRefresh: () => void
) => {
  const [assignment, setAssignment] = useState<ActiveAssignmentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !bed) return;
    if (bed.status !== 'OCCUPIED' && bed.status !== 'RESERVED') {
      setAssignment(null);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await roomApi.getActiveAssignmentByBed(bed.bedId);
        const data = (res as any)?.data ?? res;
        setAssignment(data as ActiveAssignmentResponse);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Không thể tải thông tin sinh viên.');
        setAssignment(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [open, bed]);

  const handleChangeBedStatus = async (status: BedStatus) => {
    if (!bed) return;
    setActionLoading(true);
    try {
      await roomApi.patchBedStatus(bed.bedId, status);
      onClose();
      onRefresh();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Không thể thay đổi trạng thái giường.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRoomRole = async (newRole: string) => {
    if (!assignment) return;
    setActionLoading(true);
    try {
      await roomApi.assignRoomRole(assignment.assignmentId, newRole);
      setAssignment((prev) => (prev ? { ...prev, roomRole: newRole } : null));
      onRefresh();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Không thể thay đổi chức vụ.');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    assignment,
    loading,
    actionLoading,
    error,
    handleChangeBedStatus,
    handleChangeRoomRole,
  };
};
