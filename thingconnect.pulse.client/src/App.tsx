import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthScreen } from './components/auth/AuthScreen'
import { AppLayout } from './components/layout/AppLayout'
import { authService } from './services/authService'
import { Box, Text } from '@chakra-ui/react'
import DashboardPage from './pages/DashboardPage'
import ThemeShowcasePage from './pages/ThemeShowcasePage'
import ProtectedRoute from './components/routing/ProtectedRoute'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isLoggedIn = authService.isAuthenticated()
        setIsAuthenticated(isLoggedIn)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    void checkAuth()
  }, [])

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <Box display="flex" alignItems="center" justifyContent="center" minH="50vh">
          <Text>Loading...</Text>
        </Box>
      </AppLayout>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <AppLayout>
              <AuthScreen onAuthSuccess={handleAuthSuccess} />
            </AppLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/theme-showcase"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ThemeShowcasePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  )
}

export default App
