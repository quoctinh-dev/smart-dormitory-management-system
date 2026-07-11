export type BillStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type BillType = 'ACCOMMODATION_FEE' | 'UTILITY_WATER' | 'UTILITY_ELECTRICITY' | 'DAMAGE_FEE' | 'OTHER';

export interface BillResponse {
  billId: string;
  billType: BillType;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: BillStatus;
  dueDate: string;
  description?: string;
  assignmentId?: string;
  roomCode?: string;
  bedCode?: string;
}

export interface BillAdminResponse {
  billId: string;
  billCode: string;
  studentName: string;
  amount: number;
  status: BillStatus;
  billType: BillType;
  dueDate: string;
  applicationId?: string;
}

export interface PaymentInstruction {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrCodeUrl?: string;
  contentPrefix?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
