export interface CustomerInfo {
  id: number;
  userId?: number;
  fullName: string;
  documentId?: string;
  phoneNumber?: string;
  email: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerData {
  userId?: number;
  fullName: string;
  documentId?: string;
  phoneNumber?: string;
  email: string;
  address: string;
}
