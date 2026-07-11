export type ChangeRoomRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface ChangeRoomResponseDto {
    id: number;
    reason: string;
    currentRoomName: string | null;
    targetRoomName: string | null;
    status: ChangeRoomRequestStatus;
    adminNote: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AdminProcessChangeRoomDto {
    isApproved: boolean;
    adminNote?: string;
    newBedId?: string; // Bắt buộc nếu isApproved = true
}

export interface StudentRelocation {
    studentId: string;
    targetBedId: string;
}

export interface MaintenanceRelocationDto {
    maintenanceRoomId: string;
    relocations: StudentRelocation[];
}
