import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'

interface ProtectedRouteProps {
  isAuthenticated: boolean
  children: ReactNode
}

function ProtectedRoute({ isAuthenticated, children }: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <AppLayout>{children}</AppLayout>
}

export default ProtectedRoute
