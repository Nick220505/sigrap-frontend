import { ProductInfo } from '@features/inventory/models/product.model';
import { SupplierInfo } from './supplier.model';

/**
 * Represents a purchase order status in the system
 */
export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CONFIRMED'
  | 'IN_PROCESS'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

/**
 * Represents a purchase order item info returned from the API
 */
export interface PurchaseOrderItemInfo {
  id: number;
  purchaseOrderId: number;
  product: ProductInfo;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents a purchase order info returned from the API
 */
export interface PurchaseOrderInfo {
  id: number;
  orderNumber: string;
  supplier: SupplierInfo;
  orderDate: string;
  expectedDeliveryDate?: string;
  shipDate?: string;
  actualDeliveryDate?: string;
  status: string;
  totalAmount: number;
  items: PurchaseOrderItemInfo[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Data used to create or update a purchase order item
 */
export interface PurchaseOrderItemData {
  id?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

/**
 * Data used to create or update a purchase order
 */
export interface PurchaseOrderData {
  supplierId: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  items: PurchaseOrderItemData[];
}
