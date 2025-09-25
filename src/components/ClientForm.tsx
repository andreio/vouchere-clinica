import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createClient, updateClient } from '../supabase/api'
import type { Client, ClientUpdate } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { toast } from '../lib/toast'
import { X } from 'lucide-react'

interface ClientFormProps {
  client?: Client | null
  onClose: () => void
}

export const ClientForm: React.FC<ClientFormProps> = ({ client, onClose }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    phoneNumber: client?.phoneNumber || '',
    points: client?.points || 0,
    totalSpent: client?.totalSpent || 0,
  })

  const isEditing = !!client

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success('Client created successfully')
      onClose()
    },
    onError: () => {
      toast.error('Error creating client')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ clientId, updates }: { clientId: string; updates: ClientUpdate }) =>
      updateClient(clientId, updates),
    onSuccess: () => {
      toast.success('Client updated successfully')
      onClose()
    },
    onError: () => {
      toast.error('Error updating client')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.phoneNumber.trim()) {
      toast.error('Name and phone number are required')
      return
    }

    if (isEditing && client) {
      updateMutation.mutate({
        clientId: client.clientId,
        updates: {
          name: formData.name.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          points: formData.points,
          totalSpent: formData.totalSpent,
        },
      })
    } else {
      createMutation.mutate({
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        points: formData.points,
        totalSpent: formData.totalSpent,
      })
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditing ? 'Edit Client' : 'Add New Client'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Client name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Phone number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalSpent">Total Spent</Label>
              <Input
                id="totalSpent"
                type="number"
                min="0"
                step="0.01"
                value={formData.totalSpent}
                onChange={(e) => handleInputChange('totalSpent', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update Client' : 'Create Client')
                }
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}