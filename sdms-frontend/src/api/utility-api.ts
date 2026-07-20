import axiosClient from './axios-client';
import { RoomUtilityResponse, RecordUtilityRequest } from '../types/utility';

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
  
  cancelUtilityRecord: (type: 'ELECTRICITY' | 'WATER', roomId: string, month: number, year: number): Promise<void> => {
    return axiosClient.delete('/v1/admin/utilities/record', {
      params: { type, roomId, month, year },
    });
  },
};
