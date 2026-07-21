import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

import { wrap } from '@/helpers/route-utils';
import AdminLayout from '@/layouts/AdminLayout';
import AuthLayout from '@/layouts/AuthLayout';
import RequireAdmin from '@/routes/RequireAdmin';

// Lazy-loaded admin pages
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/admin/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/admin/ResetPasswordPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const RegistrationPeriodManager = lazy(() => import('@/pages/admin/RegistrationPeriodManager'));
const ApplicationReviewQueue = lazy(() => import('@/pages/admin/ApplicationReviewQueue'));
const ApplicationReviewDetail = lazy(() => import('@/pages/admin/ApplicationReviewDetail'));
const FaceApprovalQueue = lazy(() => import('@/pages/admin/FaceApprovalQueue'));
const PaymentManagement = lazy(() => import('@/pages/admin/PaymentManagement'));
const CheckInManagement = lazy(() => import('@/pages/admin/CheckInManagement'));
const RoomManagementPage = lazy(() => import('@/pages/admin/RoomManagement/RoomManagementPage'));
const NotificationHistory = lazy(() => import('@/pages/admin/NotificationHistory'));
const ExtensionManagementPage = lazy(() => import('@/pages/admin/StayExtensionManagement'));
const CheckoutManagementPage = lazy(() => import('@/pages/admin/CheckoutManagement'));
const ChangeRoomManagementPage = lazy(() => import('@/pages/admin/ChangeRoomManagement'));
const SmartAccessManagement = lazy(() => import('@/pages/admin/SmartAccessManagement'));
const GateManagement = lazy(() => import('@/pages/admin/GateManagement'));
const UtilityReadingPage = lazy(() => import('@/pages/admin/UtilityReadingPage'));
const AccountManagementPage = lazy(() => import('@/pages/admin/AccountManagementPage'));
const StudentManagementPage = lazy(() => import('@/pages/admin/StudentManagementPage'));
const SystemConfigPage = lazy(() => import('@/pages/admin/SystemConfigPage'));

// Wrapped components for suspense
const LoginLazy = wrap(LoginPage);
const ForgotPasswordLazy = wrap(ForgotPasswordPage);
const ResetPasswordLazy = wrap(ResetPasswordPage);
const AdminDashboardLazy = wrap(AdminDashboard);
const RegistrationPeriodManagerLazy = wrap(RegistrationPeriodManager);
const ApplicationReviewQueueLazy = wrap(ApplicationReviewQueue);
const ApplicationReviewDetailLazy = wrap(ApplicationReviewDetail);
const FaceApprovalQueueLazy = wrap(FaceApprovalQueue);
const PaymentManagementLazy = wrap(PaymentManagement);
const CheckInManagementLazy = wrap(CheckInManagement);
const NotificationHistoryLazy = wrap(NotificationHistory);
const ExtensionManagementLazy = wrap(ExtensionManagementPage);
const CheckoutManagementLazy = wrap(CheckoutManagementPage);
const ChangeRoomManagementLazy = wrap(ChangeRoomManagementPage);
const RoomManagementLazy = wrap(RoomManagementPage);
const SmartAccessManagementLazy = wrap(SmartAccessManagement);
const GateManagementLazy = wrap(GateManagement);
const AccountManagementLazy = wrap(AccountManagementPage);
const StudentManagementLazy = wrap(StudentManagementPage);
const UtilityReadingPageLazy = wrap(UtilityReadingPage);
const SystemConfigPageLazy = wrap(SystemConfigPage);

export const adminRoutes: RouteObject[] = [
  // Auth layout for admin login
  {
    element: <AuthLayout />,
    children: [
      { path: 'admin/login', element: <LoginLazy /> },
      { path: 'admin/forgot-password', element: <ForgotPasswordLazy /> },
      { path: 'admin/reset-password', element: <ResetPasswordLazy /> },
    ],
  },
  // Admin routes protected by RequireAdmin
  {
    element: <RequireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'admin', element: <AdminDashboardLazy /> },
          { path: 'admin/accounts', element: <AccountManagementLazy /> },
          { path: 'admin/registration-periods', element: <RegistrationPeriodManagerLazy /> },
          { path: 'admin/applications/review', element: <ApplicationReviewQueueLazy /> },
          { path: 'admin/applications/:id/review', element: <ApplicationReviewDetailLazy /> },
          { path: 'admin/faces/approve', element: <FaceApprovalQueueLazy /> },
          { path: 'admin/payments', element: <PaymentManagementLazy /> },
          { path: 'admin/electricity', element: <UtilityReadingPageLazy /> },
          { path: 'admin/check-in', element: <CheckInManagementLazy /> },
          { path: 'admin/rooms', element: <RoomManagementLazy /> },
          { path: 'admin/change-room', element: <ChangeRoomManagementLazy /> },
          { path: 'admin/notifications', element: <NotificationHistoryLazy /> },
          { path: 'admin/extension-requests', element: <ExtensionManagementLazy /> },
          { path: 'admin/checkout-requests', element: <CheckoutManagementLazy /> },
          { path: 'admin/smart-access', element: <SmartAccessManagementLazy /> },
          { path: 'admin/gates', element: <GateManagementLazy /> },
          { path: 'admin/students', element: <StudentManagementLazy /> },
          { path: 'admin/system-configs', element: <SystemConfigPageLazy /> },
        ],
      },
    ],
  },
];
