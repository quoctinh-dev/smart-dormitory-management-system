import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import ErrorBoundary from '@/components/common/ErrorBoundary';

import { adminRoutes } from './AdminRoutes';
import { publicRoutes } from './PublicRoutes';

const AppRouter: React.FC = () => {
  const element = useRoutes([...publicRoutes, ...adminRoutes]);

  return (
    <ErrorBoundary>
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' }}>
          <CircularProgress />
        </Box>
      }>
        {element}
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRouter;
