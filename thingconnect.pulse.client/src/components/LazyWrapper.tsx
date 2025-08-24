import { Suspense } from 'react';
import { PageLoader } from './PageLoader';

interface LazyWrapperProps {
  children: React.ReactNode;
}

export function LazyWrapper({ children }: LazyWrapperProps) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}
