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
const SmartAccessPolicyPage = lazy(() => import('@/pages/admin/SmartAccessPolicyPage'));

// Wrapped components for suspense
const LoginLazy = wrap(LoginPage, { skeletonType: 'form' });
const ForgotPasswordLazy = wrap(ForgotPasswordPage, { skeletonType: 'form' });
const ResetPasswordLazy = wrap(ResetPasswordPage, { skeletonType: 'form' });
const AdminDashboardLazy = wrap(AdminDashboard, { skeletonType: 'dashboard' });
const RegistrationPeriodManagerLazy = wrap(RegistrationPeriodManager, { skeletonType: 'table', skeletonCount: 5 });
const ApplicationReviewQueueLazy = wrap(ApplicationReviewQueue, { skeletonType: 'table', skeletonCount: 5 });
const ApplicationReviewDetailLazy = wrap(ApplicationReviewDetail, { skeletonType: 'form' });
const FaceApprovalQueueLazy = wrap(FaceApprovalQueue, { skeletonType: 'table', skeletonCount: 5 });
const PaymentManagementLazy = wrap(PaymentManagement, { skeletonType: 'table', skeletonCount: 5 });
const CheckInManagementLazy = wrap(CheckInManagement, { skeletonType: 'table', skeletonCount: 5 });
const NotificationHistoryLazy = wrap(NotificationHistory, { skeletonType: 'list', skeletonCount: 5 });
const ExtensionManagementLazy = wrap(ExtensionManagementPage, { skeletonType: 'table', skeletonCount: 5 });
const CheckoutManagementLazy = wrap(CheckoutManagementPage, { skeletonType: 'table', skeletonCount: 5 });
const ChangeRoomManagementLazy = wrap(ChangeRoomManagementPage, { skeletonType: 'table', skeletonCount: 5 });
const RoomManagementLazy = wrap(RoomManagementPage, { skeletonType: 'table', skeletonCount: 5 });
const SmartAccessManagementLazy = wrap(SmartAccessManagement, { skeletonType: 'table', skeletonCount: 5 });
const GateManagementLazy = wrap(GateManagement, { skeletonType: 'table', skeletonCount: 5 });
const AccountManagementLazy = wrap(AccountManagementPage, { skeletonType: 'table', skeletonCount: 5 });
const StudentManagementLazy = wrap(StudentManagementPage, { skeletonType: 'table', skeletonCount: 5 });
const UtilityReadingPageLazy = wrap(UtilityReadingPage, { skeletonType: 'table', skeletonCount: 5 });
const SystemConfigPageLazy = wrap(SystemConfigPage, { skeletonType: 'form' });
const SmartAccessPolicyLazy = wrap(SmartAccessPolicyPage, { skeletonType: 'table', skeletonCount: 5 });

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
          { path: 'admin/smart-access/policies', element: <SmartAccessPolicyLazy /> },
        ],
      },
    ],
  },
];
