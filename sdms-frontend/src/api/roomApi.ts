// src/api/roomApi.ts
import axiosClient from './axiosClient';
import type { BedStatus, BuildingStatus, RoomStatus } from '@/types/room';

const BASE = '/v1/admin';

// ─── BUILDING ────────────────────────────────────────────────────────────────
export interface CreateBuildingPayload {
  code: string;
  name: string;
  description?: string;
  gender?: string;
}

export interface UpdateBuildingPayload {
  name: string;
  description?: string;
  status: BuildingStatus;
  gender: string;
}

// ─── FLOOR ───────────────────────────────────────────────────────────────────
export interface CreateFloorPayload {
  buildingId: string;
  floorNumber: number;
  gender?: string;
}

export interface UpdateFloorPayload {
  gender?: string;
}

// ─── ROOM ────────────────────────────────────────────────────────────────────
export interface CreateRoomPayload {
  floorId: string;
  roomCode: string;
  capacity: number;
}

export interface UpdateRoomPayload {
  capacity?: number;
  status?: RoomStatus;
}

export interface SearchRoomsParams {
  buildingId?: string;
  floorId?: string;
  status?: RoomStatus;
  policy?: string;
  page?: number;
  size?: number;
  sortBy?: string;
}

// ─── BED ─────────────────────────────────────────────────────────────────────
export interface CreateBedPayload {
  roomId: string;
  bedCode: string;
  note?: string;
}

export interface UpdateBedPayload {
  note?: string;
  status?: BedStatus;
}

// ─────────────────────────────────────────────────────────────────────────────

import type { BuildingResponse, FloorResponse, RoomResponse, BedResponse, ActiveAssignmentResponse } from '@/types/room';

const roomApi = {
  // ─── BUILDING ──────────────────────────────────────────────────────────────
  getBuildings: (): Promise<BuildingResponse[]> =>
    axiosClient.get(`${BASE}/buildings`),

  getBuildingById: (id: string): Promise<BuildingResponse> =>
    axiosClient.get(`${BASE}/buildings/${id}`),

  createBuilding: (data: CreateBuildingPayload): Promise<BuildingResponse> =>
    axiosClient.post(`${BASE}/buildings`, data),

  updateBuilding: (id: string, data: UpdateBuildingPayload): Promise<BuildingResponse> =>
    axiosClient.put(`${BASE}/buildings/${id}`, data),

  // ✅ FIX: Backend dùng @RequestParam → phải truyền qua query string, không phải body
  patchBuildingStatus: (id: string, status: BuildingStatus): Promise<BuildingResponse> =>
    axiosClient.patch(`${BASE}/buildings/${id}/status?status=${status}`),

  // ─── FLOOR ─────────────────────────────────────────────────────────────────
  getFloorsByBuilding: (buildingId: string): Promise<FloorResponse[]> =>
    axiosClient.get(`${BASE}/floors/building/${buildingId}`),

  getFloorById: (floorId: string): Promise<FloorResponse> =>
    axiosClient.get(`${BASE}/floors/${floorId}`),

  createFloor: (data: CreateFloorPayload): Promise<FloorResponse> =>
    axiosClient.post(`${BASE}/floors`, data),

  updateFloor: (floorId: string, data: UpdateFloorPayload): Promise<FloorResponse> =>
    axiosClient.put(`${BASE}/floors/${floorId}`, data),

  // ─── ROOM ──────────────────────────────────────────────────────────────────
  getRoomsByFloor: (floorId: string): Promise<RoomResponse[]> =>
    axiosClient.get(`${BASE}/rooms/floor/${floorId}`),

  getRoomById: (roomId: string): Promise<RoomResponse> =>
    axiosClient.get(`${BASE}/rooms/${roomId}`),

  createRoom: (data: CreateRoomPayload): Promise<RoomResponse> =>
    axiosClient.post(`${BASE}/rooms`, data),

  updateRoom: (roomId: string, data: UpdateRoomPayload): Promise<RoomResponse> =>
    axiosClient.put(`${BASE}/rooms/${roomId}`, data),

  // ✅ FIX: @RequestParam → query string
  patchRoomStatus: (roomId: string, status: RoomStatus): Promise<RoomResponse> =>
    axiosClient.patch(`${BASE}/rooms/${roomId}/status?status=${status}`),

  searchRooms: (params: SearchRoomsParams): Promise<{ content: RoomResponse[], totalElements: number }> =>
    axiosClient.get(`${BASE}/rooms`, { params }),

  // ─── ROOM ANALYTICS ────────────────────────────────────────────────────────
  getOccupancyAnalytics: (): Promise<any> =>
    axiosClient.get(`${BASE}/rooms/analytics/occupancy`),

  getEmergencyRelocationRooms: (): Promise<any> =>
    axiosClient.get(`${BASE}/rooms/analytics/emergency-relocation`),

  getRevenueAtRisk: (): Promise<any> =>
    axiosClient.get(`${BASE}/rooms/analytics/revenue-at-risk`),

  getMaintenanceReport: (): Promise<any> =>
    axiosClient.get(`${BASE}/rooms/analytics/maintenance-report`),

  // ─── BED ───────────────────────────────────────────────────────────────────
  getBedsByRoom: (roomId: string): Promise<BedResponse[]> =>
    axiosClient.get(`${BASE}/beds/room/${roomId}`),

  createBed: (data: CreateBedPayload): Promise<BedResponse> =>
    axiosClient.post(`${BASE}/beds`, data),

  autoGenerateBeds: (roomId: string): Promise<BedResponse[]> =>
    axiosClient.post(`${BASE}/beds/room/${roomId}/auto-generate`),

  // ✅ FIX: @RequestParam → query string
  patchBedStatus: (bedId: string, status: BedStatus): Promise<BedResponse> =>
    axiosClient.patch(`${BASE}/beds/${bedId}/status?status=${status}`),

  // ─── HOUSING ASSIGNMENT (BED DRILL-DOWN) ───────────────────────────────────
  getActiveAssignmentByBed: (bedId: string): Promise<ActiveAssignmentResponse> =>
    axiosClient.get(`${BASE}/housing-assignments/active/bed/${bedId}`),
};

export default roomApi;
