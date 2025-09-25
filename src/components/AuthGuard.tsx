import React from 'react'
import { useRequireAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'client'
  fallback?: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole,
  fallback 
}) => {
  const { loading, isAuthenticated, hasRole } = useRequireAuth(requiredRole)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && !hasRole) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}