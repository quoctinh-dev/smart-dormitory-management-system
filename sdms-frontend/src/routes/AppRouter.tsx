import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

import CustomSkeleton from '@/components/common/CustomSkeleton';
import ErrorBoundary from '@/components/common/ErrorBoundary';

import { adminRoutes } from './AdminRoutes';
import { publicRoutes } from './PublicRoutes';

const AppRouter: React.FC = () => {
  const element = useRoutes([...publicRoutes, ...adminRoutes]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<CustomSkeleton type="list" count={5} />}>{element}</Suspense>
    </ErrorBoundary>
  );
};

export default AppRouter;
