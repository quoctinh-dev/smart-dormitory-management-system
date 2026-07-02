// 📄 File: src/types/payment.ts

export interface Bill {
  id: string;
  applicationId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  type: 'REGISTRATION_FEE' | 'DEPOSIT' | 'OTHER';
  createdAt: string;
  payment: Payment | null;
  student: {
    id: string;
    fullName: string;
    cccd: string;
  };
}

export interface Payment {
  id: string;
  billId: string;
  amount: number;
  method: 'CASH' | 'ONLINE';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionCode: string | null;
  paidAt: string;
}

export interface PaymentInstruction {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrCodeUrl: string;
  content: string;
  isEnabled: boolean;
}
