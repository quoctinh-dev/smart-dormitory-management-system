import { useRoutes } from "react-router-dom";
import { publicRoutes } from "./PublicRoutes";
import { adminRoutes } from "./AdminRoutes";

export default function AppRouter() {
  return useRoutes([
    ...publicRoutes,
    ...adminRoutes,
  ]);
}