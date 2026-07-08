import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

import { RequireAdmin } from '@/auth';
import AdminLayout from '@/layouts/AdminLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { wrap } from '@/utils/routeUtils';

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
const IntegratedReviewPage = lazy(() => import('@/pages/admin/IntegratedReviewPage'));
const ExtensionManagementPage = lazy(() => import('@/pages/admin/StayExtensionManagement'));
const CheckoutManagementPage = lazy(() => import('@/pages/admin/CheckoutManagement'));
const SmartAccessManagement = lazy(() => import('@/pages/admin/SmartAccessManagement'));
const AccountManagementPage = lazy(() => import('@/pages/admin/AccountManagementPage'));

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
const IntegratedReviewPageLazy = wrap(IntegratedReviewPage);
const ExtensionManagementLazy = wrap(ExtensionManagementPage);
const CheckoutManagementLazy = wrap(CheckoutManagementPage);
const RoomManagementLazy = wrap(RoomManagementPage);
const SmartAccessManagementLazy = wrap(SmartAccessManagement);
const AccountManagementLazy = wrap(AccountManagementPage);

export const adminRoutes: RouteObject[] = [
  // Auth layout for admin login
  {
    element: <AuthLayout />,
    children: [
      { path: 'admin/login', element: <LoginLazy /> },
      { path: 'admin/forgot-password', element: <ForgotPasswordLazy /> },
      { path: 'admin/reset-password', element: <ResetPasswordLazy /> }
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
          { path: 'admin/review', element: <IntegratedReviewPageLazy /> },
          { path: 'admin/applications/review', element: <ApplicationReviewQueueLazy /> },
          { path: 'admin/applications/:id/review', element: <ApplicationReviewDetailLazy /> },
          { path: 'admin/faces/approve', element: <FaceApprovalQueueLazy /> },
          { path: 'admin/payments', element: <PaymentManagementLazy /> },
          { path: 'admin/check-in', element: <CheckInManagementLazy /> },
          { path: 'admin/rooms', element: <RoomManagementLazy /> },
          { path: 'admin/notifications', element: <NotificationHistoryLazy /> },
          { path: 'admin/extension-requests', element: <ExtensionManagementLazy /> },
          { path: 'admin/checkout-requests', element: <CheckoutManagementLazy /> },
          { path: 'admin/smart-access', element: <SmartAccessManagementLazy /> },
        ],
      },
    ],
  },
];
