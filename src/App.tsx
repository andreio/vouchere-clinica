import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from './components/ui/toast'
import { LoginPage } from './pages/LoginPage'
import { AdminPage } from './pages/AdminPage'
import { ClientPage } from './pages/ClientPage'
import { AuthGuard } from './components/AuthGuard'
import { useAuth } from './hooks/useAuth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/admin"
        element={
          <AuthGuard requiredRole="admin">
            <AdminPage />
          </AuthGuard>
        }
      />
      
      <Route
        path="/client"
        element={
          <AuthGuard requiredRole="client">
            <ClientPage />
          </AuthGuard>
        }
      />
      
      <Route
        path="/"
        element={
          user ? (
            <Navigate 
              to={user.role === 'admin' ? '/admin' : '/client'} 
              replace 
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
