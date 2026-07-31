import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

import { wrap } from '@/helpers/route-utils';
import AdminLayout from '@/layouts/AdminLayout';
import AuthLayout from '@/layouts/AuthLayout';
import RequireAdmin from '@/routes/RequireAdmin';

// ==========================================
// 1. LAZY LOADING CÁC COMPONENT
// ==========================================

// --- Nhóm trang Xác thực (Auth) ---
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/admin/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/admin/ResetPasswordPage'));

// --- Nhóm trang Tổng quan & Cấu hình ---
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const SystemConfigPage = lazy(() => import('@/pages/admin/SystemConfigPage'));
const AccountManagementPage = lazy(() => import('@/pages/admin/AccountManagementPage'));
const StudentManagementPage = lazy(() => import('@/pages/admin/StudentManagementPage'));
const NotificationHistory = lazy(() => import('@/pages/admin/NotificationHistory'));

// --- Nhóm trang Quản lý Hồ sơ & Sinh viên ---
const RegistrationPeriodManager = lazy(() => import('@/pages/admin/RegistrationPeriodManager'));
const ApplicationReviewQueue = lazy(() => import('@/pages/admin/ApplicationReviewQueue'));
const ApplicationReviewDetail = lazy(() => import('@/pages/admin/ApplicationReviewDetail'));
const FaceApprovalQueue = lazy(() => import('@/pages/admin/FaceApprovalQueue'));

// --- Nhóm trang Quản lý Vận hành, Phòng ở & Tài chính ---
const PaymentManagement = lazy(() => import('@/pages/admin/PaymentManagement'));
const CheckInManagement = lazy(() => import('@/pages/admin/CheckInManagement'));
const RoomManagementPage = lazy(() => import('@/pages/admin/RoomManagement/RoomManagementPage'));
const ExtensionManagementPage = lazy(() => import('@/pages/admin/StayExtensionManagement'));
const CheckoutManagementPage = lazy(() => import('@/pages/admin/CheckoutManagement'));
const ChangeRoomManagementPage = lazy(() => import('@/pages/admin/ChangeRoomManagement'));
const UtilityReadingPage = lazy(() => import('@/pages/admin/UtilityReadingPage'));

// --- Nhóm trang Kiểm soát Ra/Vào (Smart Access) ---
const SmartAccessManagement = lazy(() => import('@/pages/admin/SmartAccessManagement'));
const GateManagement = lazy(() => import('@/pages/admin/GateManagement'));
const SmartAccessPolicyPage = lazy(() => import('@/pages/admin/SmartAccessPolicyPage'));

// ==========================================
// 2. BỌC CÁC TRANG VỚI SKELETON LOADING
// ==========================================
const LoginLazy = wrap(LoginPage, { skeletonType: 'form' });
const ForgotPasswordLazy = wrap(ForgotPasswordPage, { skeletonType: 'form' });
const ResetPasswordLazy = wrap(ResetPasswordPage, { skeletonType: 'form' });
const AdminDashboardLazy = wrap(AdminDashboard, { skeletonType: 'dashboard' });

// Dạng bảng (Table)
const RegistrationPeriodManagerLazy = wrap(RegistrationPeriodManager, { skeletonType: 'table', skeletonCount: 5 });
const ApplicationReviewQueueLazy = wrap(ApplicationReviewQueue, { skeletonType: 'table', skeletonCount: 5 });
const FaceApprovalQueueLazy = wrap(FaceApprovalQueue, { skeletonType: 'table', skeletonCount: 5 });
const PaymentManagementLazy = wrap(PaymentManagement, { skeletonType: 'table', skeletonCount: 5 });
const CheckInManagementLazy = wrap(CheckInManagement, { skeletonType: 'table', skeletonCount: 5 });
const ExtensionManagementLazy = wrap(ExtensionManagementPage, { skeletonType: 'table', skeletonCount: 5 });
const CheckoutManagementLazy = wrap(CheckoutManagementPage, { skeletonType: 'table', skeletonCount: 5 });
const ChangeRoomManagementLazy = wrap(ChangeRoomManagementPage, { skeletonType: 'table', skeletonCount: 5 });
const RoomManagementLazy = wrap(RoomManagementPage, { skeletonType: 'table', skeletonCount: 5 });
const SmartAccessManagementLazy = wrap(SmartAccessManagement, { skeletonType: 'table', skeletonCount: 5 });
const GateManagementLazy = wrap(GateManagement, { skeletonType: 'table', skeletonCount: 5 });
const AccountManagementLazy = wrap(AccountManagementPage, { skeletonType: 'table', skeletonCount: 5 });
const StudentManagementLazy = wrap(StudentManagementPage, { skeletonType: 'table', skeletonCount: 5 });
const UtilityReadingPageLazy = wrap(UtilityReadingPage, { skeletonType: 'table', skeletonCount: 5 });
const SmartAccessPolicyLazy = wrap(SmartAccessPolicyPage, { skeletonType: 'table', skeletonCount: 5 });

// Dạng danh sách/Form
const ApplicationReviewDetailLazy = wrap(ApplicationReviewDetail, { skeletonType: 'form' });
const NotificationHistoryLazy = wrap(NotificationHistory, { skeletonType: 'list', skeletonCount: 5 });
const SystemConfigPageLazy = wrap(SystemConfigPage, { skeletonType: 'form' });

// ==========================================
// 3. CẤU HÌNH CÁC TUYẾN ĐƯỜNG (ROUTES)
// ==========================================
export const adminRoutes: RouteObject[] = [
  // --- NHÓM 1: CÁC TRANG CÔNG KHAI---
  {
    element: <AuthLayout />,
    children: [
      { path: 'admin/login', element: <LoginLazy /> },               // Trang Đăng nhập Admin
      { path: 'admin/forgot-password', element: <ForgotPasswordLazy /> }, // Trang Quên mật khẩu
      { path: 'admin/reset-password', element: <ResetPasswordLazy /> },   // Trang Đặt lại mật khẩu
    ],
  },

  // --- NHÓM 2: CÁC TRANG YÊU CẦU QUYỀN ADMIN  ---
  {
    element: <RequireAdmin />,
    children: [
      {
        element: <AdminLayout />, // Layout chung có Sidebar/Header Admin
        children: [
          // Dashboard
          { path: 'admin', element: <AdminDashboardLazy /> },

          // Quản lý hệ thống & Tài khoản
          { path: 'admin/accounts', element: <AccountManagementLazy /> },
          { path: 'admin/students', element: <StudentManagementLazy /> },
          { path: 'admin/system-configs', element: <SystemConfigPageLazy /> },
          { path: 'admin/notifications', element: <NotificationHistoryLazy /> },

          // Quản lý Đợt đăng ký & Hồ sơ
          { path: 'admin/registration-periods', element: <RegistrationPeriodManagerLazy /> },
          { path: 'admin/applications/review', element: <ApplicationReviewQueueLazy /> },
          { path: 'admin/applications/:id/review', element: <ApplicationReviewDetailLazy /> },
          { path: 'admin/faces/approve', element: <FaceApprovalQueueLazy /> },

          // Quản lý Vận hành & Lưu trú KTX
          { path: 'admin/rooms', element: <RoomManagementLazy /> },
          { path: 'admin/check-in', element: <CheckInManagementLazy /> },
          { path: 'admin/change-room', element: <ChangeRoomManagementLazy /> },
          { path: 'admin/extension-requests', element: <ExtensionManagementLazy /> },
          { path: 'admin/checkout-requests', element: <CheckoutManagementLazy /> },

          // Quản lý Tài chính & Điện nước
          { path: 'admin/payments', element: <PaymentManagementLazy /> },
          { path: 'admin/electricity', element: <UtilityReadingPageLazy /> },

          // Quản lý Cổng ra vào & Thiết bị thông minh
          { path: 'admin/smart-access', element: <SmartAccessManagementLazy /> },
          { path: 'admin/gates', element: <GateManagementLazy /> },
          { path: 'admin/smart-access/policies', element: <SmartAccessPolicyLazy /> },
        ],
      },
    ],
  },
];