export type ChangeRoomRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface ChangeRoomResponseDto {
  id: number;
  studentCode?: string;
  studentName?: string;
  reason: string;
  currentRoomName: string | null;
  targetRoomName: string | null;
  targetRoomId: string | null;
  status: ChangeRoomRequestStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProcessChangeRoomDto {
  isApproved: boolean;
  adminNote?: string;
  newBedId?: string;
}

export interface StudentRelocation {
  studentId: string;
  targetBedId: string;
}

export interface MaintenanceRelocationDto {
  maintenanceRoomId: string;
  relocations: StudentRelocation[];
}
