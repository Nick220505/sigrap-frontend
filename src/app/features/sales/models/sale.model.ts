import { UserInfo } from '@features/configuration/models/user.model';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { ProductInfo } from '@features/inventory/models/product.model';

export interface SaleItemInfo {
  id: number;
  product: ProductInfo;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleInfo {
  id: number;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  customer: CustomerInfo;
  employee: UserInfo;
  items: SaleItemInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleItemData {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleData {
  totalAmount: number;
  taxAmount: number;
  discountAmount?: number;
  finalAmount: number;
  customerId: number;
  employeeId: number;
  items: SaleItemData[];
}
