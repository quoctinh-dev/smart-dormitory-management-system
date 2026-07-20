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
