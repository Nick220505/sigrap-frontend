import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import {
  PurchaseOrderData,
  PurchaseOrderInfo,
} from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/purchase-orders`;

  /**
   * Gets all purchase orders
   */
  findAll(): Observable<PurchaseOrderInfo[]> {
    return this.http.get<PurchaseOrderInfo[]>(this.baseUrl);
  }

  /**
   * Gets a purchase order by ID
   */
  findById(id: number): Observable<PurchaseOrderInfo> {
    return this.http.get<PurchaseOrderInfo>(`${this.baseUrl}/${id}`);
  }

  /**
   * Gets all purchase orders for a specific supplier
   */
  findBySupplierId(supplierId: number): Observable<PurchaseOrderInfo[]> {
    return this.http.get<PurchaseOrderInfo[]>(
      `${this.baseUrl}/by-supplier/${supplierId}`,
    );
  }

  /**
   * Gets all purchase orders with a specific status
   */
  findByStatus(status: string): Observable<PurchaseOrderInfo[]> {
    return this.http.get<PurchaseOrderInfo[]>(
      `${this.baseUrl}/by-status/${status}`,
    );
  }

  /**
   * Creates a new purchase order
   */
  create(purchaseOrderData: PurchaseOrderData): Observable<PurchaseOrderInfo> {
    return this.http.post<PurchaseOrderInfo>(this.baseUrl, purchaseOrderData);
  }

  /**
   * Updates an existing purchase order
   */
  update(
    id: number,
    purchaseOrderData: PurchaseOrderData,
  ): Observable<PurchaseOrderInfo> {
    return this.http.put<PurchaseOrderInfo>(
      `${this.baseUrl}/${id}`,
      purchaseOrderData,
    );
  }

  /**
   * Deletes a purchase order
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Submits a purchase order
   */
  submitOrder(id: number): Observable<PurchaseOrderInfo> {
    return this.http.patch<PurchaseOrderInfo>(
      `${this.baseUrl}/${id}/submit`,
      {},
    );
  }

  /**
   * Confirms a purchase order
   */
  confirmOrder(id: number): Observable<PurchaseOrderInfo> {
    return this.http.patch<PurchaseOrderInfo>(
      `${this.baseUrl}/${id}/confirm`,
      {},
    );
  }

  /**
   * Marks a purchase order as shipped
   */
  markAsShipped(id: number): Observable<PurchaseOrderInfo> {
    return this.http.patch<PurchaseOrderInfo>(`${this.baseUrl}/${id}/ship`, {});
  }

  /**
   * Marks a purchase order as delivered
   */
  markAsDelivered(
    id: number,
    actualDeliveryDate: string,
  ): Observable<PurchaseOrderInfo> {
    return this.http.patch<PurchaseOrderInfo>(
      `${this.baseUrl}/${id}/deliver`,
      {},
      { params: { actualDeliveryDate } },
    );
  }

  /**
   * Cancels a purchase order
   */
  cancelOrder(id: number): Observable<PurchaseOrderInfo> {
    return this.http.patch<PurchaseOrderInfo>(
      `${this.baseUrl}/${id}/cancel`,
      {},
    );
  }
}
