export interface CustomerInfo {
  id: number;
  userId?: number;
  firstName: string;
  lastName: string;
  documentId?: string;
  phoneNumber?: string;
  email: string;
  address: string;
  status: CustomerStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerData {
  userId?: number;
  firstName: string;
  lastName: string;
  documentId?: string;
  phoneNumber?: string;
  email: string;
  address: string;
  status: CustomerStatus;
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}
