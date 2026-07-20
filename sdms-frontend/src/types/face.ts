// src/types/face.ts
export interface FaceProfileResponse {
  profileId: string;
  studentId: string;
  fullName: string;
  imageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
}

export interface FaceActionParams {
  page?: number;
  size?: number;
  sort?: string;
}
