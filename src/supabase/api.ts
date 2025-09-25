import { supabase } from './client'
import type { Client, ClientUpdate, PointsAdjustment, SpendingRecord } from '../types'

// Client management functions
export const getAllClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

export const getClient = async (clientId: string): Promise<Client | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('clientId', clientId)
    .single()
  
  if (error) throw error
  return data
}

export const createClient = async (client: Omit<Client, 'clientId' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .insert([{
      clientId: crypto.randomUUID(),
      ...client,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateClient = async (clientId: string, updates: ClientUpdate): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .update({
      ...updates,
      updatedAt: new Date().toISOString()
    })
    .eq('clientId', clientId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteClient = async (clientId: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('clientId', clientId)
  
  if (error) throw error
}

export const adjustClientPoints = async (adjustment: PointsAdjustment): Promise<Client> => {
  // First get current client data
  const client = await getClient(adjustment.clientId)
  if (!client) throw new Error('Client not found')
  
  const newPoints = client.points + adjustment.points
  
  // Update client points
  const { data, error } = await supabase
    .from('clients')
    .update({
      points: newPoints,
      updatedAt: new Date().toISOString()
    })
    .eq('clientId', adjustment.clientId)
    .select()
    .single()
  
  if (error) throw error
  
  // Log the adjustment
  await supabase
    .from('points_adjustments')
    .insert([{
      clientId: adjustment.clientId,
      points: adjustment.points,
      reason: adjustment.reason || '',
      createdAt: new Date().toISOString()
    }])
  
  return data
}

export const addSpending = async (spending: SpendingRecord): Promise<Client> => {
  // First get current client data
  const client = await getClient(spending.clientId)
  if (!client) throw new Error('Client not found')
  
  const newTotalSpent = client.totalSpent + spending.amount
  // Award 1 point for every dollar spent
  const newPoints = client.points + Math.floor(spending.amount)
  
  // Update client
  const { data, error } = await supabase
    .from('clients')
    .update({
      totalSpent: newTotalSpent,
      points: newPoints,
      updatedAt: new Date().toISOString()
    })
    .eq('clientId', spending.clientId)
    .select()
    .single()
  
  if (error) throw error
  
  // Log the spending
  await supabase
    .from('spending_records')
    .insert([{
      clientId: spending.clientId,
      amount: spending.amount,
      description: spending.description || '',
      createdAt: new Date().toISOString()
    }])
  
  return data
}