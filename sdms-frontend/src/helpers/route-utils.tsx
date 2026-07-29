import React, { Suspense } from 'react';
import { Container } from '@mui/material';
import CustomSkeleton, { SkeletonType } from '@/components/common/CustomSkeleton';

interface WrapOptions {
  skeletonType?: SkeletonType;
  skeletonCount?: number;
  withContainer?: boolean;
}

/**
 * A Higher-Order Component (HOC) that wraps a component with React.Suspense.
 * This is used to show a fallback UI (like a skeleton loader) while the component is being lazy-loaded.
 *
 * @param Component The React component to wrap.
 * @param options Optional configuration for the skeleton fallback.
 * @returns A new component that renders the original component within a Suspense boundary.
 */
export const wrap = <P extends object>(
  Component: React.ComponentType<P>,
  options?: WrapOptions
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { skeletonType = 'card', skeletonCount = 3, withContainer = false } = options || {};

    const skeletonContent = <CustomSkeleton type={skeletonType} count={skeletonCount} />;

    return (
      <Suspense 
        fallback={
          withContainer ? (
            <Container maxWidth="lg" sx={{ pt: 10, pb: 10 }}>
              {skeletonContent}
            </Container>
          ) : (
            skeletonContent
          )
        }
      >
        <Component {...(props as P)} />
      </Suspense>
    );
  };

  // Assign a display name for better debugging in React DevTools
  const displayName = Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `withSuspense(${displayName})`;

  return WrappedComponent;
};
