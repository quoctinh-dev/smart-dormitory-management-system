import { lazy } from 'react';

import { RequireAdmin } from '@/auth';
import AdminLayout from '@/layouts/AdminLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { wrap } from '@/utils/routeUtils';

// 1. Giữ nguyên cơ chế Lazy Loading cũ
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const RegistrationPeriodManager = lazy(() => import('@/pages/admin/RegistrationPeriodManager'));
const ApplicationReviewQueue = lazy(() => import('@/pages/admin/ApplicationReviewQueue'));
const ApplicationReviewDetail = lazy(() => import('@/pages/admin/ApplicationReviewDetail'));
const FaceApprovalQueue = lazy(() => import('@/pages/admin/FaceApprovalQueue'));
const RoomDashboard = lazy(() => import('@/pages/admin/RoomDashboard'));
const PaymentManagement = lazy(() => import('@/pages/admin/PaymentManagement'));
const CheckInManagement = lazy(() => import('@/pages/admin/CheckInManagement'));

// 2. KHÔI PHỤC HÀM WRAP: Trả lại đúng luồng bọc component cũ của dự án bạn
const LoginLazy = wrap(LoginPage);
const AdminDashboardLazy = wrap(AdminDashboard);
const RegistrationPeriodManagerLazy = wrap(RegistrationPeriodManager);
const ApplicationReviewQueueLazy = wrap(ApplicationReviewQueue);
const ApplicationReviewDetailLazy = wrap(ApplicationReviewDetail);
const FaceApprovalQueueLazy = wrap(FaceApprovalQueue);
const RoomDashboardLazy = wrap(RoomDashboard);
const PaymentManagementLazy = wrap(PaymentManagement);
const CheckInManagementLazy = wrap(CheckInManagement);

export const adminRoutes = [
  // Nhóm Auth Layout cũ
  {
    element: <AuthLayout />,
    children: [
      { path: 'admin/login', element: <LoginLazy /> },
    ],
  },
  // Nhóm Admin yêu cầu xác thực cũ
  {
    element: <RequireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'admin', element: <AdminDashboardLazy /> },
          { path: 'admin/registration-periods', element: <RegistrationPeriodManagerLazy /> },
          { path: 'admin/applications/review', element: <ApplicationReviewQueueLazy /> },
          { path: 'admin/applications/:id/review', element: <ApplicationReviewDetailLazy /> },
          { path: 'admin/faces/approve', element: <FaceApprovalQueueLazy /> },
          { path: 'admin/rooms/dashboard', element: <RoomDashboardLazy /> },
          { path: 'admin/payments', element: <PaymentManagementLazy /> },
          { path: 'admin/check-in', element: <CheckInManagementLazy /> },
        ],
      },
    ],
  },
];