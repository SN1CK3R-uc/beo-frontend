export type Role = 'ceo' | 'manager' | 'treasurer' | 'secretary' | 'ict' | 'member';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  sex: 'Male' | 'Female';
  dob: string;
  createdAt: string;
  signatureUrl?: string;
}

export interface Balance {
  amountMWK: number;
}

export interface Transaction {
  id: string;
  date: string;
  amountMWK: number;
  channel: string;
  purpose: string;
}