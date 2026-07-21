// src/types/dashboard.ts

export interface HourlyTraffic {
  time: string;
  in: number;
  out: number;
}

export interface DashboardStatsResponse {
  pendingApplications: number;
  waitingForPayment: number;
  pendingCheckIn: number;
  occupiedAssignments: number;
  totalRooms: number;
  totalBeds: number;
  totalBuildings: number;
  totalFloors: number;
  studentsInside: number;
  studentsOutside: number;
  hourlyTraffic: HourlyTraffic[];
  totalCollectedAmount: number;
  paidBillsCount: number;
  unpaidBillsCount: number;

  // Advanced charting data
  applicationsByStatus?: Record<string, number>;
  extensionsByStatus?: Record<string, number>;
  billsByStatus?: Record<string, number>;
}

export interface ExpiringAssignmentDto {
  assignmentId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  buildingName: string;
  roomName: string;
  bedName: string;
  endDate: string;
}
