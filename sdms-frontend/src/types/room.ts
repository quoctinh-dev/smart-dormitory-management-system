// src/types/room.ts
// ⚠️ SOURCE OF TRUTH: Map 1-1 với Backend DTO. KHÔNG tự ý sửa enum/field mà không kiểm tra Backend trước.

export type BuildingStatus = 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
export type BuildingGender = 'MALE' | 'FEMALE' | 'MIXED';
export type RoomStatus = 'AVAILABLE' | 'FULL' | 'MAINTENANCE' | 'CLOSED';
export type BedStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE';
export type AssignmentStatus =
  'RESERVED' | 'PENDING_CHECKIN' | 'OCCUPIED' | 'CANCELLED' | 'EXPIRED' | 'CHECKED_OUT';

// ─── BUILDING  ───
export interface BuildingResponse {
  buildingId: string; // UUID
  code: string;
  name: string;
  description?: string;
  status: BuildingStatus;
  gender: BuildingGender;
  createdAt: string;
}

// ─── FLOOR  ───
export interface FloorResponse {
  floorId: string; // UUID
  floorNumber: number;
  gender?: string;
  buildingId: string;
  buildingCode: string;
  buildingName: string;
}

// ─── ROOM  ───
export interface RoomResponse {
  roomId: string; // UUID
  roomCode: string;
  capacity: number;
  occupiedBeds: number;
  availableBeds: number;
  status: RoomStatus;
  floorId: string;
  floorNumber: number;
  buildingId: string;
  buildingCode: string;
  buildingName: string;
  roomPinCode?: string;
}

// ─── BED ───
export interface BedResponse {
  bedId: string; // UUID
  bedCode: string;
  status: BedStatus;
  note?: string;
  roomId: string;
  roomCode: string;
  floorId: string;
  floorNumber: number;
  buildingId: string;
  buildingCode: string;
}

// ─── COMPOSITE ───
export interface RoomWithBeds extends RoomResponse {
  beds: BedResponse[];
}

// ─── STUDENT INFO ───
export interface StudentInfo {
  studentId: string;
  studentCode: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

// ─── ACTIVE ASSIGNMENT ───
export interface ActiveAssignmentResponse {
  assignmentId: string;
  status: AssignmentStatus;
  reservedAt?: string;
  checkInAt?: string;
  expectedCheckOutAt?: string;
  roomRole?: string;
  student?: StudentInfo;
  bedId: string;
  bedCode: string;
  roomCode: string;
  buildingName: string;
}
