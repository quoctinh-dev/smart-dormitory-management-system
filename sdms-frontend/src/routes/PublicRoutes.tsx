import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

import { wrap } from '@/helpers/route-utils';
import PublicLayout from '@/layouts/PublicLayout';

// 1. Khai báo lazy loading các trang công khai
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const RegistrationPage = lazy(() => import('@/pages/public/RegistrationPage'));
const StatusPage = lazy(() => import('@/pages/public/StatusPage'));
const PaymentPage = lazy(() => import('@/pages/public/PaymentPage'));
const ActivateAccountPage = lazy(() => import('@/pages/public/ActivateAccountPage'));

// 2. Bọc component qua hàm wrap phục vụ tối ưu render của Sinh viên
const HomeLazy = wrap(HomePage);
const RegisterLazy = wrap(RegistrationPage);
const StatusLazy = wrap(StatusPage);
const PaymentLazy = wrap(PaymentPage);
const ActivateLazy = wrap(ActivateAccountPage);

export const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomeLazy /> },
      { path: 'register', element: <RegisterLazy /> },
      { path: 'status', element: <StatusLazy /> },
      { path: 'payment/:applicationId', element: <PaymentLazy /> },
      { path: 'activate-account', element: <ActivateLazy /> },
    ],
  },
];
