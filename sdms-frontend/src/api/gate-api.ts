import axiosClient from './axios-client';
import { GateRequest, GateResponse } from '../types/gate';

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
