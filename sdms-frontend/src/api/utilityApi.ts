import axiosClient from './axiosClient';

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

export const utilityApi = {
  getRoomsForRecording: (
    month: number, 
    year: number, 
    type: 'ELECTRICITY' | 'WATER', 
    buildingId?: string, 
    floorId?: string
  ): Promise<RoomUtilityResponse[]> => {
    return axiosClient.get('/v1/admin/utilities/rooms', {
      params: { month, year, type, buildingId, floorId },
    });
  },

  recordUtility: (type: 'ELECTRICITY' | 'WATER', data: RecordUtilityRequest): Promise<void> => {
    return axiosClient.post('/v1/admin/utilities/record', data, {
      params: { type },
    });
  },
};
