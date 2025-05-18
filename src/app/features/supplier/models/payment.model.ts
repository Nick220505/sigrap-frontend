export interface PaymentInfo {
  id: number;
  purchaseOrderId?: number | null;
  purchaseOrderNumber?: string | null;
  supplierId: number;
  supplierName: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentData {
  purchaseOrderId?: number | null;
  supplierId: number;
  amount: number;
}
