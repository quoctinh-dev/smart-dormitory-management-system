// src/types/stay-extension.ts
export interface StayExtensionResponse {
  extensionId: string;
  studentId: string;
  studentCode: string;
  fullName: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  currentBedId: string;
  currentBedCode: string;
  currentRoomCode: string;
  contractPdfUrl: string | null;
  commitmentPdfUrl: string | null;
  description: string;
  rejectReason: string | null;
  oldExpectedCheckOutAt: string;
  newExpectedCheckOutAt: string;
}

export interface StayExtensionReviewRequest {
  status: 'APPROVED' | 'REJECTED';
  rejectReason?: string;
}
