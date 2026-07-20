// src/types/gate.ts
export interface GateRequest {
  name: string;
  gateType: 'BUILDING_GATE' | 'ROOM_DOOR';
  buildingId?: string;
  roomId?: string;
  macAddress?: string;
  active: boolean;
}

export interface GateResponse {
  gateId: string;
  name: string;
  gateType: 'BUILDING_GATE' | 'ROOM_DOOR';
  buildingId: string | null;
  buildingName: string | null;
  roomId: string | null;
  roomCode: string | null;
  macAddress: string | null;
  active: boolean;
}
