import { UserInfo } from '@features/configuration/models/user.model';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { ProductInfo } from '@features/inventory/models/product.model';

export enum SaleStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  PARTIALLY_RETURNED = 'PARTIALLY_RETURNED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT',
  OTHER = 'OTHER',
}

export interface SaleItemInfo {
  id: number;
  product: ProductInfo;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface SaleInfo {
  id: number;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  notes?: string;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  customer?: CustomerInfo;
  employee: UserInfo;
  items: SaleItemInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleItemData {
  productId: number;
  quantity: number;
  unitPrice: number;
  discount?: number;
  subtotal: number;
}

export interface SaleData {
  totalAmount: number;
  taxAmount: number;
  discountAmount?: number;
  finalAmount: number;
  notes?: string;
  paymentMethod: PaymentMethod;
  status?: SaleStatus;
  customerId?: number;
  employeeId: number;
  items: SaleItemData[];
}
