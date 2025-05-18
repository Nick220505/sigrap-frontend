import { ProductInfo } from '@features/inventory/models/product.model';
import { SupplierInfo } from './supplier.model';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CONFIRMED'
  | 'IN_PROCESS'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PAID';

export interface PurchaseOrderItemInfo {
  id: number;
  purchaseOrderId: number;
  product: ProductInfo;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderInfo {
  id: number;
  orderNumber: string;
  supplier: SupplierInfo;
  deliveryDate?: string;
  status: string;
  totalAmount: number;
  items: PurchaseOrderItemInfo[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderItemData {
  id?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrderData {
  supplierId: number;
  deliveryDate?: string;
  items: PurchaseOrderItemData[];
}
