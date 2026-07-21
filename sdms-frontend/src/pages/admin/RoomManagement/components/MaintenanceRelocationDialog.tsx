import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import { changeRoomApi } from '@/api/change-room-api';
import roomApi from '@/api/room-api';
import { snackbar } from '@/helpers/snackbar';
import type { RoomWithBeds, BedResponse, ActiveAssignmentResponse } from '@/types/room';
import type { EmergencyRelocationRoom } from '@/api/room-api';

export interface MaintenanceRelocationDialogProps {
  open: boolean;
  onClose: () => void;
  room: RoomWithBeds | null;
  onSuccess: () => void;
}

export default function MaintenanceRelocationDialog({
                                                      open,
                                                      onClose,
                                                      room,
                                                      onSuccess,
                                                    }: MaintenanceRelocationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [relocating, setRelocating] = useState(false);

  // Data for the dialog
  const [assignments, setAssignments] = useState<ActiveAssignmentResponse[]>([]);
  const [emergencyRooms, setEmergencyRooms] = useState<EmergencyRelocationRoom[]>([]);

  // State for user selections: studentId -> { targetRoomId, targetBedId, availableBeds }
  const [selections, setSelections] = useState<
      Record<string, { targetRoomId: string; targetBedId: string; availableBeds: BedResponse[] }>
  >({});

  useEffect(() => {
    if (open && room) {
      fetchData();
    }
  }, [open, room]);

  const fetchData = async () => {
    if (!room) return;
    setLoading(true);
    try {
      // 1. Fetch active assignments for occupied beds in the current room
      const occupiedBeds = room.beds.filter((b) => b.status === 'OCCUPIED' || b.status === 'RESERVED');
      const assignmentPromises = occupiedBeds.map((bed) =>
          roomApi.getActiveAssignmentByBed(bed.bedId).catch(() => null)
      );
      const results = await Promise.all(assignmentPromises);
      const validAssignments = results.filter((res): res is ActiveAssignmentResponse => res !== null);
      setAssignments(validAssignments);

      // Initialize selections mapping
      const initialSelections: Record<string, any> = {};
      validAssignments.forEach((a) => {
        if (a.student) {
          initialSelections[a.student.studentId] = {
            targetRoomId: '',
            targetBedId: '',
            availableBeds: [],
          };
        }
      });
      setSelections(initialSelections);

      // 2. Fetch available rooms for emergency relocation
      const rooms = await roomApi.getEmergencyRelocationRooms();
      // Filter out the current room
      setEmergencyRooms(rooms.filter(r => r.roomId !== room.roomId));

    } catch (error) {
      snackbar.error('Lỗi khi tải dữ liệu di dời');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = async (studentId: string, targetRoomId: string) => {
    // Update targetRoomId, clear targetBedId
    setSelections((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], targetRoomId, targetBedId: '', availableBeds: [] },
    }));

    if (!targetRoomId) return;

    try {
      const beds = await roomApi.getBedsByRoom(targetRoomId);
      const availableBeds = beds.filter((b) => b.status === 'AVAILABLE');

      setSelections((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], availableBeds },
      }));
    } catch (error) {
      snackbar.error('Lỗi khi tải danh sách giường trống');
    }
  };

  const handleBedSelect = (studentId: string, targetBedId: string) => {
    setSelections((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], targetBedId },
    }));
  };

  const handleSubmit = async () => {
    if (!room) return;

    // STRICT DATA CONSISTENCY CHECK (Thesis Requirement)
    if (assignments.length === 0) {
      snackbar.error('Phát hiện dữ liệu bất đồng bộ: Phòng báo bận nhưng không tìm thấy hợp đồng sinh viên. Vui lòng đồng bộ lại dữ liệu DB.');
      return;
    }

    // Check if all students have a target bed selected
    const relocations: { studentId: string; targetBedId: string }[] = [];

    for (const assignment of assignments) {
      if (!assignment.student) continue;
      const studentId = assignment.student.studentId;
      const targetBedId = selections[studentId]?.targetBedId;

      if (!targetBedId) {
        snackbar.warning(`Vui lòng chọn giường mới cho sinh viên ${assignment.student.fullName}`);
        return;
      }

      relocations.push({ studentId, targetBedId });
    }

    if (relocations.length === 0) {
      snackbar.error('Không có sinh viên hợp lệ để di dời.');
      return;
    }

    try {
      setRelocating(true);
      await changeRoomApi.relocateForMaintenance({
        maintenanceRoomId: room.roomId,
        relocations,
      });
      snackbar.success('Điều chuyển khẩn cấp thành công! Cửa IoT đã được đồng bộ.');
      onSuccess();
    } catch (error: any) {
      snackbar.error(error.response?.data?.message || 'Lỗi khi điều chuyển sinh viên');
    } finally {
      setRelocating(false);
    }
  };

  return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 600, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          Điều chuyển khẩn cấp (Phòng {room?.roomCode})
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5, overflow: 'visible' }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 1.5 }}>
            Tính năng này tự động gọi API di dời sinh viên sang giường mới và đồng bộ OTA xuống Gateway IoT (Cập nhật quyền thẻ từ ở cổng và mã PIN ở cửa phòng) ngay lập tức.
          </Alert>

          {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
          ) : assignments.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4, fontStyle: 'italic' }}>
                Không tìm thấy sinh viên nào trong phòng này. Bạn có thể trực tiếp chuyển sang bảo trì.
              </Typography>
          ) : (
              <Stack spacing={2}>
                {assignments.map((assignment) => {
                  if (!assignment.student) return null;
                  const student = assignment.student;
                  const selection = selections[student.studentId] || { targetRoomId: '', targetBedId: '', availableBeds: [] };

                  return (
                      <Box key={student.studentId} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                          {student.fullName} — <span style={{ fontFamily: 'monospace' }}>{student.studentCode}</span>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          Đang ở: Giường <strong>{assignment.bedCode}</strong>
                        </Typography>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Chọn Phòng tạm</InputLabel>
                            <Select
                                label="Chọn Phòng tạm"
                                value={selection.targetRoomId}
                                onChange={(e) => handleRoomSelect(student.studentId, e.target.value)}
                                sx={{ borderRadius: 1.5 }}
                            >
                              <MenuItem value="">-- Chọn phòng --</MenuItem>
                              {emergencyRooms.map((r) => (
                                  <MenuItem key={r.roomId} value={r.roomId}>
                                    [{r.buildingName}] Phòng {r.roomCode} (Trống {r.vacantBeds})
                                  </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl fullWidth size="small" disabled={!selection.targetRoomId}>
                            <InputLabel>Chọn Giường</InputLabel>
                            <Select
                                label="Chọn Giường"
                                value={selection.targetBedId}
                                onChange={(e) => handleBedSelect(student.studentId, e.target.value)}
                                sx={{ borderRadius: 1.5 }}
                            >
                              <MenuItem value="">-- Chọn giường --</MenuItem>
                              {selection.availableBeds.map((b) => (
                                  <MenuItem key={b.bedId} value={b.bedId}>
                                    Giường {b.bedCode}
                                  </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Stack>
                      </Box>
                  );
                })}
              </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={relocating} sx={{ textTransform: 'none', borderRadius: 1.5, color: 'text.secondary' }}>
            Hủy
          </Button>
          <Button
              variant="contained"
              disableElevation
              color="primary"
              onClick={handleSubmit}
              disabled={relocating || loading || assignments.length === 0}
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 3 }}
          >
            {relocating ? 'Đang xử lý...' : 'Lưu & Di dời khẩn cấp'}
          </Button>
        </DialogActions>
      </Dialog>
  );
}