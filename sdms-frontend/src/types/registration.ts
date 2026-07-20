export type RegistrationType = 'CURRENT_RESIDENT' | 'NEW_STUDENT' | 'OPEN_REGISTRATION';

export interface RegistrationPeriodResponse {
  periodId: string;
  periodName: string;
  registrationType: RegistrationType;
  startDate: string;
  endDate: string;
  isActive: boolean;
  stayStartDate: string;
  stayEndDate: string;
}

export interface CreateRegistrationPeriodRequest {
  periodName: string;
  registrationType: RegistrationType;
  startDate: string;
  endDate: string;
  stayStartDate: string;
  stayEndDate: string;
}

export interface UpdateRegistrationPeriodRequest {
  periodName: string;
  registrationType: RegistrationType;
  startDate: string;
  endDate: string;
  stayStartDate: string;
  stayEndDate: string;
}

export interface EligibilityImportResponse {
  totalRows: number;
  importedRows: number;
  skippedRows: number;
}

export interface EligibilityResponse {
  eligibilityId: string;
  cccd: string;
  fullName: string;
  studentCode: string;
  email: string;
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
  email: string;
  otp: string;
}

export interface CheckEligibilityResponse {
  eligible: boolean;
  periodId: string | null;
  periodName: string | null;
  registrationType: RegistrationType | null;
  fullName: string | null;
  cccd: string | null;
  studentCode: string | null;
  target: string | null;
  message: string;
}
