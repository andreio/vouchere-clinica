import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signInWithOtp } from '../supabase/client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { toast } from '../lib/toast'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginMode, setLoginMode] = useState<'admin' | 'client'>('admin')
  const navigate = useNavigate()

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Login successful')
        navigate('/admin')
      }
    } catch {
      toast.error('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await signInWithOtp(email)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Check your email for the magic link!')
      }
    } catch {
      toast.error('An error occurred sending the magic link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Dental Loyalty</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button
              variant={loginMode === 'admin' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setLoginMode('admin')}
            >
              Admin
            </Button>
            <Button
              variant={loginMode === 'client' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setLoginMode('client')}
            >
              Client
            </Button>
          </div>

          {loginMode === 'admin' ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleClientLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client-email">Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Magic Link'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                We'll send you a secure link to sign in
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}