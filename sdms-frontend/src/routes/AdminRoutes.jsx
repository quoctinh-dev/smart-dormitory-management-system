import { lazy } from "react";
import { wrap } from "./utils";
import AuthLayout from "@/layouts/AuthLayout";
import AdminLayout from "@/layouts/AdminLayout";
import { RequireAdmin } from "@/auth";

const LoginPage = lazy(() => import("@/pages/admin/LoginPage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const RegistrationPeriodManager = lazy(() => import("@/pages/admin/RegistrationPeriodManager"));

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
        ]
      }
    ]
  }
];