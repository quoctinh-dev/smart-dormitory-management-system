import axiosClient from './axiosClient';

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

const gateApi = {
  getAllGates(): Promise<GateResponse[]> {
    return axiosClient.get('/v1/gates');
  },

  getGateById(id: string): Promise<GateResponse> {
    return axiosClient.get(`/v1/gates/${id}`);
  },

  createGate(data: GateRequest): Promise<GateResponse> {
    return axiosClient.post('/v1/gates', data);
  },

  updateGate(id: string, data: GateRequest): Promise<GateResponse> {
    return axiosClient.put(`/v1/gates/${id}`, data);
  },

  deleteGate(id: string): Promise<void> {
    return axiosClient.delete(`/v1/gates/${id}`);
  },
};

export default gateApi;
