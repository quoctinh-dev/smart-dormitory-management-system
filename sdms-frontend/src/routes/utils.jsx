import { Suspense } from "react";
import CustomSkeleton from "@/components/CustomSkeleton";

export const wrap = (Component) => (
  <Suspense fallback={<CustomSkeleton type="card" count={3} />}>
    <Component />
  </Suspense>
);