// src/types/smart-access.ts
export type ResidentType = 'BOARDING' | 'NON_BOARDING';
export type CurfewType = 'STANDARD' | 'HARD_LOCKDOWN' | 'SPECIAL_EVENT';

export interface CurfewPolicy {
  id: string;
  buildingId: string;
  residentType: ResidentType;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  type: CurfewType;
  priority: number;
  isActive: boolean;
}

export interface TimeWindowPolicy {
  id: string;
  buildingId: string;
  residentType: ResidentType;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isActive: boolean;
}
