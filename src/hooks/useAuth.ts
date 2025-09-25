import { useState, useEffect } from 'react'
import { supabase, getCurrentUser, getUserRole, getClientId } from '../supabase/client'
import type { User as AppUser } from '../types'

export const useAuth = () => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { user: supabaseUser } = await getCurrentUser()
        if (supabaseUser) {
          const role = await getUserRole(supabaseUser.id)
          const clientId = role === 'client' ? await getClientId(supabaseUser.id) : undefined
          
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email,
            role: role || 'client',
            clientId: clientId || undefined,
          })
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const role = await getUserRole(session.user.id)
          const clientId = role === 'client' ? await getClientId(session.user.id) : undefined
          
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: role || 'client',
            clientId: clientId || undefined,
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

export const useRequireAuth = (requiredRole?: 'admin' | 'client') => {
  const { user, loading } = useAuth()
  
  const isAuthenticated = !!user
  const hasRole = !requiredRole || user?.role === requiredRole
  const canAccess = isAuthenticated && hasRole
  
  return { user, loading, isAuthenticated, hasRole, canAccess }
}