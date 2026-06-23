import { lazy } from 'react';

import PublicLayout from '@/layouts/PublicLayout';
import { wrap } from '@/utils/routeUtils';

// 1. Khai báo lazy loading cũ
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const RegistrationPage = lazy(() => import('@/pages/public/RegistrationPage'));
const StatusPage = lazy(() => import('@/pages/public/StatusPage'));
const PaymentPage = lazy(() => import('@/pages/public/PaymentPage'));
const ActivateAccountPage = lazy(() => import('@/pages/public/ActivateAccountPage'));

// 2. KHÔI PHỤC HÀM WRAP: Đưa về luồng bọc component cũ của phía Sinh viên
const HomeLazy = wrap(HomePage);
const RegisterLazy = wrap(RegistrationPage);
const StatusLazy = wrap(StatusPage);
const PaymentLazy = wrap(PaymentPage);
const ActivateLazy = wrap(ActivateAccountPage);

export const publicRoutes = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomeLazy /> },
      { path: 'register', element: <RegisterLazy /> },
      { path: 'status', element: <StatusLazy /> },
      { path: 'payment/:applicationId', element: <PaymentLazy /> },
      { path: 'activate', element: <ActivateLazy /> },
    ],
  },
];