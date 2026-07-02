// 📄 File: src/types/application.ts

export type DocumentType =
  | 'PROFILE_PICTURE'
  | 'CCCD_FRONT'
  | 'CCCD_BACK'
  | 'HEALTH_CERTIFICATE'
  | 'STUDENT_CARD'
  | 'FAMILY_CERTIFICATE'
  | 'PRIORITY_CERTIFICATE';

export interface ApplicationDocument {
  id: string;
  type: DocumentType;
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  studentId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED';
  rejectionReason: string | null;
  priorityType:
    'NONE' | 'POOR_HOUSEHOLD' | 'NEAR_POOR_HOUSEHOLD' | 'DISADVANTAGED' | 'ETHNIC_MINORITY';
  submittedAt: string;
  documents: ApplicationDocument[];
  student: {
    id: string;
    fullName: string;
    cccd: string;
  };
}
