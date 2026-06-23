import { lazy } from "react";
import { wrap } from "./utils";
import PublicLayout from "@/layouts/PublicLayout";

const HomePage = lazy(() => import("@/pages/public/HomePage"));
const RegistrationPage = lazy(() => import("@/pages/public/RegistrationPage"));
const StatusPage = lazy(() => import("@/pages/public/StatusPage"));
const PaymentPage = lazy(() => import("@/pages/public/PaymentPage"));
const FaceRegistrationPage = lazy(() => import("@/pages/public/FaceRegistrationPage"));
const ActivateAccountPage = lazy(() => import("@/pages/public/ActivateAccountPage"));

export const publicRoutes = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: wrap(HomePage) },
      { path: "register", element: wrap(RegistrationPage) },
      { path: "status", element: wrap(StatusPage) },
      { path: "payment/:applicationId", element: wrap(PaymentPage) },
      { path: "face-registration", element: wrap(FaceRegistrationPage) },
      { path: "activate", element: wrap(ActivateAccountPage) },
    ]
  }
];