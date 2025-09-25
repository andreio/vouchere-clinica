export interface Client {
  clientId: string;
  name: string;
  phoneNumber: string;
  points: number;
  totalSpent: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email?: string;
  role: 'admin' | 'client';
  clientId?: string;
}

export interface AuthUser extends User {
  accessToken: string;
}

export interface ClientUpdate {
  name?: string;
  phoneNumber?: string;
  points?: number;
  totalSpent?: number;
}

export interface PointsAdjustment {
  clientId: string;
  points: number;
  reason?: string;
}

export interface SpendingRecord {
  clientId: string;
  amount: number;
  description?: string;
}