import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '@/components/PageLoader';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, setupRequired } = useAuth();

  // Show loading while checking authentication status
  if (isLoading) {
    return <PageLoader />;
  }

  // If setup is required, redirect to onboarding
  if (setupRequired) {
    return <Navigate to="/onboarding" replace />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If admin-only route and user is not admin, show access denied
  if (adminOnly && user?.role !== 'Administrator') {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}