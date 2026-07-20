import React, { Suspense } from 'react';

import CustomSkeleton from '@/components/common/CustomSkeleton';

/**
 * A Higher-Order Component (HOC) that wraps a component with React.Suspense.
 * This is used to show a fallback UI (like a skeleton loader) while the component is being lazy-loaded.
 *
 * @param Component The React component to wrap.
 * @returns A new component that renders the original component within a Suspense boundary.
 */
export const wrap = <P extends object>(Component: React.ComponentType<P>): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <Suspense fallback={<CustomSkeleton type="card" count={3} />}>
        <Component {...(props as P)} />
      </Suspense>
    );
  };

  // Assign a display name for better debugging in React DevTools
  const displayName = Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `withSuspense(${displayName})`;

  return WrappedComponent;
};
