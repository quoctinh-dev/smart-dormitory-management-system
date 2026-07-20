// src/types/check-in.ts
export interface CheckInSearchResponse {
  assignmentId: string;
  studentName: string;
  studentCode: string;
  cccd: string;
  gender: string;
  portraitUrl: string;
  buildingName: string;
  floorName: string;
  roomName: string;
  bedName: string;
}

export interface HousingAssignmentDto {
  assignmentId: string;
  status: string; // 'PENDING_CHECKIN' | 'OCCUPIED'
  checkInAt?: string;
  student: {
    studentCode: string;
    fullName: string;
    cccd?: string;
  };
  buildingName: string;
  roomCode: string;
  bedCode: string;
}

export interface HousingAssignmentListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}
