import { Suspense } from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';

export const wrap = (Component) => {
  return function WrappedComponent(props) {
    return (
      <Suspense fallback={<CustomSkeleton type="card" count={3} />}>
        <Component {...props} />
      </Suspense>
    );
  };
};