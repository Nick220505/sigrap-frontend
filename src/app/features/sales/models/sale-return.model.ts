import { UserInfo } from '@features/configuration/models/user.model';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { ProductInfo } from '@features/inventory/models/product.model';

export interface SaleReturnItemInfo {
  id: number;
  product: ProductInfo;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleReturnInfo {
  id: number;
  originalSaleId: number;
  totalReturnAmount: number;
  customer: CustomerInfo;
  employee: UserInfo;
  items: SaleReturnItemInfo[];
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleReturnItemData {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleReturnData {
  originalSaleId: number;
  totalReturnAmount: number;
  customerId: number;
  employeeId: number;
  items: SaleReturnItemData[];
  reason?: string;
}
