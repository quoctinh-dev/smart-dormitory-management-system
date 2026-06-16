import { lazy } from "react";
import { wrap } from "./utils";
import PublicLayout from "@/layouts/PublicLayout";

const HomePage = lazy(() => import("@/pages/public/HomePage"));
const RegistrationPage = lazy(() => import("@/pages/public/RegistrationPage"));
const StatusPage = lazy(() => import("@/pages/public/StatusPage"));

export const publicRoutes = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: wrap(HomePage) },
      { path: "register", element: wrap(RegistrationPage) },
      { path: "status", element: wrap(StatusPage) },
    ]
  }
];