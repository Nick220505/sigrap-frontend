export interface SupplierInfo {
  id: number;
  name: string;
  taxId?: string;
  contactPerson?: string;
  phone?: string;
  alternativePhone?: string;
  email?: string;
  address?: string;
  website?: string;
  productsProvided?: string;
  averageDeliveryTime?: number;
  paymentMethod?: string;
  paymentTerms?: string;
  notes?: string;
  status: string;
  rating?: number;
  preferred?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierData {
  name: string;
  taxId?: string;
  contactPerson?: string;
  phone?: string;
  alternativePhone?: string;
  email?: string;
  address?: string;
  website?: string;
  productsProvided?: string;
  averageDeliveryTime?: number;
  paymentMethod?: string;
  paymentTerms?: string;
  notes?: string;
  status: string;
  rating?: number;
  preferred?: boolean;
}

export type SupplierStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PROBATION'
  | 'TERMINATED'
  | 'BLACKLISTED';

export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'CASH'
  | 'CHECK'
  | 'PAYPAL'
  | 'OTHER';
