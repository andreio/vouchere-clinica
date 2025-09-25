import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getClient, updateClient } from '../supabase/api'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { toast } from '../lib/toast'
import { signOut } from '../supabase/client'
import { useNavigate } from 'react-router-dom'
import { LogOut, Phone, Award, DollarSign } from 'lucide-react'

export const ClientPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', user?.clientId],
    queryFn: () => user?.clientId ? getClient(user.clientId) : null,
    enabled: !!user?.clientId,
  })

  const updatePhoneMutation = useMutation({
    mutationFn: (newPhone: string) => {
      if (!user?.clientId) throw new Error('No client ID')
      return updateClient(user.clientId, { phoneNumber: newPhone })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', user?.clientId] })
      toast.success('Phone number updated successfully')
      setIsEditing(false)
    },
    onError: () => {
      toast.error('Error updating phone number')
    },
  })

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
      toast.success('Logged out successfully')
    } catch {
      toast.error('Error logging out')
    }
  }

  const handleEditPhone = () => {
    if (client) {
      setPhoneNumber(client.phoneNumber)
      setIsEditing(true)
    }
  }

  const handleSavePhone = () => {
    if (phoneNumber.trim()) {
      updatePhoneMutation.mutate(phoneNumber.trim())
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setPhoneNumber('')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Client Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Client Profile Not Found</h2>
                <p className="text-muted-foreground">
                  Your client profile couldn't be found. Please contact the administrator.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Welcome, {client.name}!</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{client.points}</div>
              <p className="text-xs text-muted-foreground">
                Available for rewards
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${client.totalSpent.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Lifetime spending
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <div className="mt-1 text-sm text-muted-foreground">{client.name}</div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Phone Number</Label>
              {isEditing ? (
                <div className="mt-2 flex gap-2">
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone number"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSavePhone}
                    disabled={updatePhoneMutation.isPending}
                    size="sm"
                  >
                    {updatePhoneMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{client.phoneNumber}</span>
                  <Button 
                    onClick={handleEditPhone}
                    variant="outline"
                    size="sm"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Update
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Client ID</Label>
              <div className="mt-1 text-sm text-muted-foreground font-mono">
                {client.clientId}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Loyalty Program Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Earn 1 point for every $1 spent</p>
              <p>• Points can be redeemed for discounts and services</p>
              <p>• Keep track of your spending and rewards here</p>
              <p>• Contact the clinic for point redemption</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}