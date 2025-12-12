import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PurchaseOrderData, PurchaseOrderInfo } from '../models/purchase-order';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private readonly http = inject(HttpClient);

  /**
   * Gets all purchase orders
   */
  findAll(): Observable<PurchaseOrderInfo[]> {
    return this.http.get<PurchaseOrderInfo[]>('/purchase-orders');
  }

  /**
   * Gets a purchase order by ID
   */
  findById(id: number): Observable<PurchaseOrderInfo> {
    return this.http.get<PurchaseOrderInfo>(`/purchase-orders/${id}`);
  }

  /**
   * Gets all purchase orders for a specific supplier
   */
  findBySupplierId(supplierId: number): Observable<PurchaseOrderInfo[]> {
    return this.http.get<PurchaseOrderInfo[]>(
      `/purchase-orders/by-supplier/${supplierId}`,
    );
  }

  /**
   * Gets all purchase orders with a specific status
   */
  findByStatus(status: string): Observable<PurchaseOrderInfo[]> {
    return this.http.get<PurchaseOrderInfo[]>(
      `/purchase-orders/by-status/${status}`,
    );
  }

  /**
   * Creates a new purchase order
   */
  create(purchaseOrderData: PurchaseOrderData): Observable<PurchaseOrderInfo> {
    return this.http.post<PurchaseOrderInfo>(
      '/purchase-orders',
      purchaseOrderData,
    );
  }

  /**
   * Updates an existing purchase order
   */
  update(
    id: number,
    purchaseOrderData: PurchaseOrderData,
  ): Observable<PurchaseOrderInfo> {
    return this.http.put<PurchaseOrderInfo>(
      `/purchase-orders/${id}`,
      purchaseOrderData,
    );
  }

  /**
   * Deletes a purchase order
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/purchase-orders/${id}`);
  }

  /**
   * Submits a purchase order
   */
  submitOrder(id: number): Observable<PurchaseOrderInfo> {
    return this.http.patch<PurchaseOrderInfo>(
      `/purchase-orders/${id}/submit`,
      {},
    );
  }

  /**
   * Confirms a purchase order
   */
  confirmOrder(id: number): Observable<PurchaseOrderInfo> {
    return this.http.patch<PurchaseOrderInfo>(
      `/purchase-orders/${id}/confirm`,
      {},
    );
  }

  /**
   * Marks a purchase order as shipped
   */
  markAsShipped(id: number): Observable<PurchaseOrderInfo> {
    return this.http.patch<PurchaseOrderInfo>(
      `/purchase-orders/${id}/ship`,
      {},
    );
  }

  /**
   * Marks a purchase order as delivered
   */
  markAsDelivered(
    id: number,
    actualDeliveryDate: string,
  ): Observable<PurchaseOrderInfo> {
    return this.http.patch<PurchaseOrderInfo>(
      `/purchase-orders/${id}/deliver`,
      {},
      {
        params: {
          actualDeliveryDate,
        },
      },
    );
  }

  /**
   * Cancels a purchase order
   */
  cancelOrder(id: number): Observable<PurchaseOrderInfo> {
    return this.http.patch<PurchaseOrderInfo>(
      `/purchase-orders/${id}/cancel`,
      {},
    );
  }

  /**
   * Marks a purchase order as paid
   */
  markAsPaid(id: number): Observable<PurchaseOrderInfo> {
    return this.http.patch<PurchaseOrderInfo>(`/purchase-orders/${id}/pay`, {});
  }
}
