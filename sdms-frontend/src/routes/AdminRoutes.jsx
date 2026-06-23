import { lazy } from "react";
import { wrap } from "./utils";
import AuthLayout from "@/layouts/AuthLayout";
import AdminLayout from "@/layouts/AdminLayout";
import { RequireAdmin } from "@/auth";

const LoginPage = lazy(() => import("@/pages/admin/LoginPage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const RegistrationPeriodManager = lazy(() => import("@/pages/admin/RegistrationPeriodManager"));
const ApplicationReviewQueue = lazy(() => import("@/pages/admin/ApplicationReviewQueue"));
const ApplicationReviewDetail = lazy(() => import("@/pages/admin/ApplicationReviewDetail"));
const FaceApprovalQueue = lazy(() => import("@/pages/admin/FaceApprovalQueue"));
const RoomDashboard = lazy(() => import("@/pages/admin/RoomDashboard"));
const PaymentManagement = lazy(() => import("@/pages/admin/PaymentManagement"));
const CheckInManagement = lazy(() => import("@/pages/admin/CheckInManagement"));

export const adminRoutes = [
  // Nhóm Auth
  {
    element: <AuthLayout />,
    children: [
      { path: "admin/login", element: wrap(LoginPage) }
    ]
  },
  // Nhóm Admin yêu cầu xác thực
  {
    element: <RequireAdmin />, 
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "admin", element: wrap(AdminDashboard) },
          { path: "admin/registration-periods", element: wrap(RegistrationPeriodManager) },
          { path: "admin/applications/review", element: wrap(ApplicationReviewQueue) },
          { path: "admin/applications/:id/review", element: wrap(ApplicationReviewDetail) },
          { path: "admin/faces/approve", element: wrap(FaceApprovalQueue) },
          { path: "admin/rooms/dashboard", element: wrap(RoomDashboard) },
          { path: "admin/payments", element: wrap(PaymentManagement) },
          { path: "admin/check-in", element: wrap(CheckInManagement) },
        ]
      }
    ]
  }
];