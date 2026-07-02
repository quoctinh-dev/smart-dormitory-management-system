// 📄 File: src/types/room.ts

export type BuildingStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'UNAVAILABLE';
export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export interface Building {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'MIXED';
  status: BuildingStatus;
  floors: Floor[];
}

export interface Floor {
  id: string;
  name: string;
  buildingId: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
  floorId: string;
  capacity: number;
  status: RoomStatus;
  beds: Bed[];
  occupancy: number;
}

export interface Bed {
  id: string;
  name: string;
  roomId: string;
  status: BedStatus;
}

export interface RoomAssignment {
  id: string;
  student: {
    id: string;
    fullName: string;
    studentId: string;
  };
  room: {
    id: string;
    name: string;
    floor: {
      id: string;
      name: string;
      building: {
        id: string;
        name: string;
      };
    };
  };
  bed: {
    id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_CHECKOUT';
}

export interface OccupancyAnalytics {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
}

export interface EmergencyRelocationOption {
  roomId: string;
  roomName: string;
  availableBeds: number;
  floorName: string;
  buildingName: string;
}
