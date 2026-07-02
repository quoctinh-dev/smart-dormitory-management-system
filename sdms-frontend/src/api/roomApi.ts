// @ts-nocheck
// src/api/roomApi.js
import axiosClient from './axiosClient';

const BASE_URL = '/v1/admin';

const roomApi = {
  // --- BUILDING CONTROLLER ---
  getBuildings: () => axiosClient.get(`${BASE_URL}/buildings`),
  getBuildingById: (id) => axiosClient.get(`${BASE_URL}/buildings/${id}`),
  createBuilding: (data) => axiosClient.post(`${BASE_URL}/buildings`, data),
  updateBuilding: (id, data) => axiosClient.put(`${BASE_URL}/buildings/${id}`, data),
  patchBuildingStatus: (id, status) =>
    axiosClient.patch(`${BASE_URL}/buildings/${id}/status`, { status }),

  // --- FLOOR CONTROLLER ---
  getFloorsByBuilding: (buildingId) => axiosClient.get(`${BASE_URL}/floors/building/${buildingId}`),
  getFloorById: (floorId) => axiosClient.get(`${BASE_URL}/floors/${floorId}`),
  createFloor: (data) => axiosClient.post(`${BASE_URL}/floors`, data),
  updateFloor: (floorId, data) => axiosClient.put(`${BASE_URL}/floors/${floorId}`, data),

  // --- ROOM CONTROLLER ---
  getRoomsByFloor: (floorId) => axiosClient.get(`${BASE_URL}/rooms/floor/${floorId}`),
  getRoomById: (roomId) => axiosClient.get(`${BASE_URL}/rooms/${roomId}`),
  createRoom: (data) => axiosClient.post(`${BASE_URL}/rooms`, data),
  updateRoom: (roomId, data) => axiosClient.put(`${BASE_URL}/rooms/${roomId}`, data),
  patchRoomStatus: (roomId, status) =>
    axiosClient.patch(`${BASE_URL}/rooms/${roomId}/status`, { status }),

  // --- BED CONTROLLER ---
  getBedsByRoom: (roomId) => axiosClient.get(`${BASE_URL}/beds/room/${roomId}`),
  createBed: (data) => axiosClient.post(`${BASE_URL}/beds`, data),
  patchBedStatus: (bedId, status) =>
    axiosClient.patch(`${BASE_URL}/beds/${bedId}/status`, { status }),
};

export default roomApi;
