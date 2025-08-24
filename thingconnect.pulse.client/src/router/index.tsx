import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LazyWrapper } from '@/components/LazyWrapper';

// Lazy load page components for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const EndpointDetail = lazy(() => import('@/pages/EndpointDetail'));
const History = lazy(() => import('@/pages/History'));
const Config = lazy(() => import('@/pages/Config'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
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
        path: 'config',
        element: (
          <LazyWrapper>
            <Config />
          </LazyWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <LazyWrapper>
            <Settings />
          </LazyWrapper>
        ),
      },
      {
        path: '404',
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
    ],
  },
]);
