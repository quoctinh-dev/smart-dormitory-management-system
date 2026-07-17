// src/types/room.ts
// ⚠️ SOURCE OF TRUTH: Map 1-1 với Backend DTO. KHÔNG tự ý sửa enum/field mà không kiểm tra Backend trước.

// ─── ENUMS (phải khớp chính xác với Java Enum trong backend) ─────────────────
export type BuildingStatus = 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
export type BuildingGender = 'MALE' | 'FEMALE' | 'MIXED';
// RoomStatus: AVAILABLE, FULL, MAINTENANCE, CLOSED (đã có FULL từ HousingAssignmentService)
export type RoomStatus = 'AVAILABLE' | 'FULL' | 'MAINTENANCE' | 'CLOSED';
// BedStatus: AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE (từ BedStatus.java)
export type BedStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE';
export type AssignmentStatus =
  'RESERVED' | 'PENDING_CHECKIN' | 'OCCUPIED' | 'CANCELLED' | 'EXPIRED' | 'CHECKED_OUT';

// ─── BUILDING (khớp BuildingResponse.java) ───────────────────────────────────
export interface BuildingResponse {
  buildingId: string; // UUID
  code: string;
  name: string;
  description?: string;
  status: BuildingStatus;
  gender: BuildingGender;
  createdAt: string;
}

// ─── FLOOR (khớp FloorResponse.java) ─────────────────────────────────────────
export interface FloorResponse {
  floorId: string; // UUID
  floorNumber: number;
  gender?: string;
  buildingId: string;
  buildingCode: string;
  buildingName: string;
}

// ─── ROOM (khớp RoomResponse.java) ───────────────────────────────────────────
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

// ─── BED (khớp BedResponse.java) ─────────────────────────────────────────────
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

// ─── COMPOSITE (dùng trong Dashboard - gộp Room + Beds) ──────────────────────
export interface RoomWithBeds extends RoomResponse {
  beds: BedResponse[];
}

// ─── STUDENT INFO (trả về khi bấm vào giường đang ở - Bed Drill-down) ────────
export interface StudentInfo {
  studentId: string;
  studentCode: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

// ─── ACTIVE ASSIGNMENT (khớp với endpoint GET /housing-assignments/active/bed/{bedId}) ──
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
