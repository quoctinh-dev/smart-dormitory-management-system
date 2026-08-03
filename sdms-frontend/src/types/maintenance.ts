export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'REJECTED';

export interface MaintenanceResponse {
    id: string;
    roomId: string;
    studentId: string;
    description: string;
    imageUrl?: string;
    status: MaintenanceStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMaintenanceRequest {
    description: string;
    imageUrl?: string;
}

export interface UpdateMaintenanceStatusRequest {
    status: MaintenanceStatus;
}
