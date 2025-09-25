import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signInWithOtp = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getUserRole = async (userId: string): Promise<'admin' | 'client' | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (error || !data) return null
  return data.role
}

export const getClientId = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('client_id')
    .eq('id', userId)
    .single()
  
  if (error || !data) return null
  return data.client_id
}