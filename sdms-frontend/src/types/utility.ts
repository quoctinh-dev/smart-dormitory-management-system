// src/types/utility.ts
export interface RoomUtilityResponse {
  roomId: string;
  roomCode: string;
  oldReading: number;
  newReading: number | null;
  isSettled: boolean;
  isFirstRecord: boolean;
}

export interface RecordUtilityRequest {
  roomId: string;
  month: number;
  year: number;
  newReading: number;
  oldReading?: number;
}

export interface StudentUtilityResponse {
  utilityUsageId: string;
  roomId: string;
  utilityType: string;
  month: number;
  year: number;
  oldReading: number;
  newReading: number;
  totalUsage: number;
  isSettled: boolean;
  readingDate: string | null;
}
