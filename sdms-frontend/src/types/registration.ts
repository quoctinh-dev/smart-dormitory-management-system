// 📄 File: src/types/registration.ts

export interface RegistrationPeriod {
  id: string;
  name: string;
  registrationType: 'NEW' | 'EXTENSION';
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'UPCOMING' | 'ENDED';
}

export interface CreateRegistrationPeriodRequest {
  name: string;
  registrationType: 'NEW' | 'EXTENSION';
  startDate: string;
  endDate: string;
}

export interface UpdateRegistrationPeriodRequest {
  name?: string;
  registrationType?: 'NEW' | 'EXTENSION';
  startDate?: string;
  endDate?: string;
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
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;

    empty: boolean;
  };
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
  target: 'NEW' | 'EXTENSION' | null;
  fullName: string | null;
  message: string;
}
