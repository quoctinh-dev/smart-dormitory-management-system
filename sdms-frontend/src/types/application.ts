export type ApplicationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'REQUEST_REVISION'
  | 'WAITING_PAYMENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'WAITING_LIST'
  | 'EXPIRED';
export type DocumentStatus = 'PENDING' | 'VALID' | 'INVALID';

export interface DocumentResponse {
  documentId: string;
  documentType: string;
  documentName: string;
  fileUrl: string;
  status: DocumentStatus;
  remarks: string;
}

export interface AssignmentInfo {
  buildingName: string;
  floorName: string;
  roomName: string;
  bedName: string;
}

export interface ApplicationResponse {
  applicationId: string;
  applicationCode: string;
  studentCode: string;
  fullName: string;
  cccd: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  cohort?: string;
  permanentAddress: string;
  contactAddress: string;
  priorityCategories: string[];
  documents: DocumentResponse[];
  status: ApplicationStatus;
  priorityScore: number;
  registrationFormPdfUrl?: string;
  commitmentFormPdfUrl?: string;
  reviewNote?: string;
  submittedAt?: string;
  revisionDeadline?: string;
  assignment?: AssignmentInfo;
}

export interface ApplicationCreateRequest {
  periodId: string;
  studentCode: string;
  fullName: string;
  dob: string;
  gender: string;
  cccd: string;
  email: string;
  phone: string;
  cohort?: string;
  permanentAddress: string;
  contactAddress: string;
  issueDate?: string | null;
  issuePlace: string;
  pob: string;
  ethnic: string;
  religion: string;
  faculty: string;
  fatherName: string;
  fatherYob?: number | null;
  fatherJob: string;
  fatherPhone: string;
  motherName: string;
  motherYob?: number | null;
  motherJob: string;
  motherPhone: string;
  priorityCategories: string[];
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}
