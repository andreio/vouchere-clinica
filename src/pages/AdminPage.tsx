import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllClients, deleteClient } from '../supabase/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { toast } from '../lib/toast'
import { Plus, Edit, Trash2, DollarSign, Award, LogOut } from 'lucide-react'
import { signOut } from '../supabase/client'
import { useNavigate } from 'react-router-dom'
import { ClientForm } from '../components/ClientForm'
import { PointsAdjustment } from '../components/PointsAdjustment'
import { SpendingForm } from '../components/SpendingForm'
import type { Client } from '../types'

export const AdminPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showPointsAdjust, setShowPointsAdjust] = useState(false)
  const [showSpendingForm, setShowSpendingForm] = useState(false)
  const navigate = useNavigate()

  const { data: clients = [], refetch, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  })

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phoneNumber.includes(searchTerm)
  )

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
      toast.success('Logged out successfully')
    } catch {
      toast.error('Error logging out')
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      await deleteClient(clientId)
      refetch()
      toast.success('Client deleted successfully')
    } catch {
      toast.error('Error deleting client')
    }
  }

  const handleClientAction = (client: Client, action: 'edit' | 'points' | 'spending') => {
    setSelectedClient(client)
    if (action === 'edit') {
      setShowCreateForm(true)
    } else if (action === 'points') {
      setShowPointsAdjust(true)
    } else if (action === 'spending') {
      setShowSpendingForm(true)
    }
  }

  const handleFormClose = () => {
    setSelectedClient(null)
    setShowCreateForm(false)
    setShowPointsAdjust(false)
    setShowSpendingForm(false)
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.reduce((sum, client) => sum + client.points, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${clients.reduce((sum, client) => sum + client.totalSpent, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Clients</CardTitle>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
            <div className="flex gap-4">
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Points</th>
                    <th className="text-left p-2">Total Spent</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.clientId} className="border-b">
                      <td className="p-2 font-medium">{client.name}</td>
                      <td className="p-2">{client.phoneNumber}</td>
                      <td className="p-2">{client.points}</td>
                      <td className="p-2">${client.totalSpent.toFixed(2)}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClientAction(client, 'edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClientAction(client, 'points')}
                          >
                            <Award className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClientAction(client, 'spending')}
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClient(client.clientId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {(showCreateForm || selectedClient) && (
        <ClientForm
          client={selectedClient}
          onClose={handleFormClose}
        />
      )}

      {showPointsAdjust && selectedClient && (
        <PointsAdjustment
          client={selectedClient}
          onClose={handleFormClose}
        />
      )}

      {showSpendingForm && selectedClient && (
        <SpendingForm
          client={selectedClient}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}