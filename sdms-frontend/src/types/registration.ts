// 📄 File: src/types/registration.ts

export type RegistrationType = 'CURRENT_RESIDENT' | 'NEW_STUDENT' | 'OPEN_REGISTRATION';

export interface RegistrationPeriodResponse {
  periodId: string;
  periodName: string;
  registrationType: RegistrationType;
  startDate: string;
  endDate: string;
  isActive: boolean;
  stayStartDate?: string;
  stayEndDate?: string;
}

export interface CreateRegistrationPeriodRequest {
  periodName: string;
  registrationType: RegistrationType;
  startDate: string;
  endDate: string;
  stayStartDate?: string;
  stayEndDate?: string;
}

export interface UpdateRegistrationPeriodRequest {
  periodName?: string;
  registrationType?: RegistrationType;
  startDate?: string;
  endDate?: string;
  stayStartDate?: string;
  stayEndDate?: string;
}

export interface EligibilityImportResponse {
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
}

export interface Eligibility {
  id: string;
  student: {
    id: string;
    fullName: string;
    cccd: string;
    studentId: string;
  };
  registered: boolean;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  pageable: any;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: any;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface CheckEligibilityRequest {
  cccd: string;
}

export interface CheckEligibilityResponse {
  eligible: boolean;
  periodId: string | null;
  target: RegistrationType | null;
  fullName: string | null;
  message: string;
}
