import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adjustClientPoints } from '../supabase/api'
import type { Client } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { toast } from '../lib/toast'
import { X, Plus, Minus } from 'lucide-react'

interface PointsAdjustmentProps {
  client: Client
  onClose: () => void
}

export const PointsAdjustment: React.FC<PointsAdjustmentProps> = ({ client, onClose }) => {
  const [points, setPoints] = useState<number>(0)
  const [reason, setReason] = useState('')
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add')

  const adjustPointsMutation = useMutation({
    mutationFn: adjustClientPoints,
    onSuccess: () => {
      toast.success('Points adjusted successfully')
      onClose()
    },
    onError: () => {
      toast.error('Error adjusting points')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (points <= 0) {
      toast.error('Please enter a valid number of points')
      return
    }

    const adjustment = adjustmentType === 'add' ? points : -points
    
    adjustPointsMutation.mutate({
      clientId: client.clientId,
      points: adjustment,
      reason: reason.trim() || undefined,
    })
  }

  const newPointsTotal = client.points + (adjustmentType === 'add' ? points : -points)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Adjust Points - {client.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Current Points:</span>
              <span className="font-semibold">{client.points}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>After Adjustment:</span>
              <span className={`font-semibold ${newPointsTotal < 0 ? 'text-destructive' : 'text-primary'}`}>
                {newPointsTotal}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={adjustmentType === 'add' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setAdjustmentType('add')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Points
                </Button>
                <Button
                  type="button"
                  variant={adjustmentType === 'subtract' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setAdjustmentType('subtract')}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Subtract Points
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="points">Number of Points *</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={points || ''}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                placeholder="Enter points to adjust"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Birthday bonus, Service correction"
              />
            </div>

            {newPointsTotal < 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  Warning: This adjustment would result in negative points ({newPointsTotal}).
                </p>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={adjustPointsMutation.isPending || points <= 0}
              >
                {adjustPointsMutation.isPending 
                  ? 'Adjusting...' 
                  : `${adjustmentType === 'add' ? 'Add' : 'Subtract'} ${points} Points`
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