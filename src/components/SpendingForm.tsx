import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { addSpending } from '../supabase/api'
import type { Client } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { toast } from '../lib/toast'
import { X, DollarSign, Award } from 'lucide-react'

interface SpendingFormProps {
  client: Client
  onClose: () => void
}

export const SpendingForm: React.FC<SpendingFormProps> = ({ client, onClose }) => {
  const [amount, setAmount] = useState<number>(0)
  const [description, setDescription] = useState('')

  const addSpendingMutation = useMutation({
    mutationFn: addSpending,
    onSuccess: () => {
      toast.success('Spending recorded successfully')
      onClose()
    },
    onError: () => {
      toast.error('Error recording spending')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    addSpendingMutation.mutate({
      clientId: client.clientId,
      amount,
      description: description.trim() || undefined,
    })
  }

  const pointsToEarn = Math.floor(amount)
  const newPointsTotal = client.points + pointsToEarn
  const newTotalSpent = client.totalSpent + amount

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Spending - {client.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Points:</span>
                <span className="font-semibold flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  {client.points}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Current Total Spent:</span>
                <span className="font-semibold flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {client.totalSpent.toFixed(2)}
                </span>
              </div>
            </div>

            {amount > 0 && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg space-y-2">
                <h4 className="font-medium text-primary">After This Purchase:</h4>
                <div className="flex justify-between text-sm">
                  <span>Points to Earn:</span>
                  <span className="font-semibold text-primary">+{pointsToEarn}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>New Points Total:</span>
                  <span className="font-semibold text-primary">{newPointsTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>New Total Spent:</span>
                  <span className="font-semibold text-primary">${newTotalSpent.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Spent *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="pl-9"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Client will earn 1 point for every $1 spent
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Service Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Dental cleaning, Consultation"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={addSpendingMutation.isPending || amount <= 0}
              >
                {addSpendingMutation.isPending 
                  ? 'Recording...' 
                  : `Record $${amount.toFixed(2)} Purchase`
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