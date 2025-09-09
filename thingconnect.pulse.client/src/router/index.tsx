import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LazyWrapper } from '@/components/LazyWrapper';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

// Lazy load page components for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const EndpointDetail = lazy(() => import('@/pages/EndpointDetail'));
const History = lazy(() => import('@/pages/History'));
const Configuration = lazy(() => import('@/pages/Configuration'));
const Settings = lazy(() => import('@/pages/Settings'));
const About = lazy(() => import('@/pages/About'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const AccessDenied = lazy(() => import('@/pages/AccessDenied'));

// Auth components
const LoginPage = lazy(() => import('@/features/auth/components/LoginPage'));
const OnboardingPage = lazy(() => import('@/features/auth/components/OnboardingPage'));

export const router = createBrowserRouter([
  // Public routes (no authentication required)
  {
    path: '/login',
    element: (
      <LazyWrapper>
        <LoginPage />
      </LazyWrapper>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <LazyWrapper>
        <OnboardingPage />
      </LazyWrapper>
    ),
  },
  {
    path: '/access-denied',
    element: (
      <LazyWrapper>
        <AccessDenied />
      </LazyWrapper>
    ),
  },
  // Protected routes (authentication required)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <Dashboard />
          </LazyWrapper>
        ),
      },
      {
        path: 'endpoints/:id',
        element: (
          <LazyWrapper>
            <EndpointDetail />
          </LazyWrapper>
        ),
      },
      {
        path: 'history',
        element: (
          <LazyWrapper>
            <History />
          </LazyWrapper>
        ),
      },
      {
        path: 'about',
        element: (
          <LazyWrapper>
            <About />
          </LazyWrapper>
        ),
      },
    ],
  },
  // Admin-only routes
  {
    path: '/configuration',
    element: (
      <ProtectedRoute adminOnly>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <Configuration />
          </LazyWrapper>
        ),
      },
    ],
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute adminOnly>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <Settings />
          </LazyWrapper>
        ),
      },
    ],
  },
  // Error routes
  {
    path: '/404',
    element: (
      <LazyWrapper>
        <NotFound />
      </LazyWrapper>
    ),
  },
  {
    path: '*',
    element: <Navigate to='/404' replace />,
  },
]);
