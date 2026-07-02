// This file serves as a barrel for all hooks, categorized by area.
// This allows for clean imports, e.g., `import { useLogin } from '@/hooks';`

export * from './useApplicationQueue';
export * from './useApplicationReview';
export * from './useCheckIn';
export * from './useEligibilityManager';
export * from './useFaceApproval';
export * from './useLogin';

export * from './usePaymentManagement';
export * from './useRegistrationManagerUi';
export * from './useRoomDashboard';

export * from './useNotifications';

export * from './useActivateAccount';
export * from './useApplicationStatus';
export * from './useHome';
export * from './usePayment';
export * from './useRegistration';
