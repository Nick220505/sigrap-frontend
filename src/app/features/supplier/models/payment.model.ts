export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CASH = 'CASH',
  CHECK = 'CHECK',
  PAYPAL = 'PAYPAL',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export interface PaymentInfo {
  id: number;
  purchaseOrderId?: number | null;
  purchaseOrderNumber?: string | null;
  supplierId: number;
  supplierName: string;
  paymentDate?: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  invoiceNumber: string;
  dueDate: string;
  transactionId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentData {
  purchaseOrderId?: number | null;
  supplierId: number;
  paymentDate?: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  invoiceNumber: string;
  dueDate: string;
  transactionId?: string | null;
  notes?: string | null;
}

export const PAYMENT_STATUS_ES: Record<string, string> = {
  [PaymentStatus.PENDING]: 'Pendiente',
  [PaymentStatus.PROCESSING]: 'Procesando',
  [PaymentStatus.COMPLETED]: 'Pagado',
  [PaymentStatus.FAILED]: 'Fallido',
  [PaymentStatus.CANCELLED]: 'Cancelado',
  [PaymentStatus.OVERDUE]: 'Vencido',
};

export const PAYMENT_METHOD_ES: Record<string, string> = {
  [PaymentMethod.BANK_TRANSFER]: 'Transferencia Bancaria',
  [PaymentMethod.CREDIT_CARD]: 'Tarjeta de Crédito',
  [PaymentMethod.DEBIT_CARD]: 'Tarjeta de Débito',
  [PaymentMethod.CASH]: 'Efectivo',
  [PaymentMethod.CHECK]: 'Cheque',
  [PaymentMethod.PAYPAL]: 'PayPal',
  [PaymentMethod.OTHER]: 'Otro',
};
