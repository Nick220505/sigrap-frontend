export interface SupplierInfo {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  alternativePhone?: string;
  email?: string;
  address?: string;
  website?: string;
  productsProvided?: string;
  averageDeliveryTime?: number;
  paymentTerms?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierData {
  name: string;
  contactPerson?: string;
  phone?: string;
  alternativePhone?: string;
  email?: string;
  address?: string;
  website?: string;
  productsProvided?: string;
  averageDeliveryTime?: number;
  paymentTerms?: string;
}
