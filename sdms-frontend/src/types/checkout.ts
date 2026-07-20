// src/types/checkout.ts
export interface CheckoutRequestResponse {
  requestId: string;
  studentId: string;
  studentCode: string;
  fullName: string;
  assignmentId: string;
  roomCode: string;
  bedCode: string;
  intendedCheckoutDate: string;
  reason: string;
  bankAccountNumber: string;
  bankName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectReason: string | null;
  createdAt: string;
}

export interface CheckoutRequestReviewDto {
  status: 'APPROVED' | 'REJECTED';
  rejectReason?: string;
}
