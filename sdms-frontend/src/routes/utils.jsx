import { Suspense } from "react";
import CustomSkeleton from "@/components/CustomSkeleton";

// eslint-disable-next-line no-unused-vars
export const wrap = (WrappedComponent) => (
  <Suspense fallback={<CustomSkeleton type="card" count={3} />}>
    <WrappedComponent />
  </Suspense>
);