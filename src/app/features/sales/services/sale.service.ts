import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { SaleData, SaleInfo } from '../models/sale.model';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly salesUrl = `${environment.apiUrl}/sales`;

  findAll(): Observable<SaleInfo[]> {
    return this.http.get<SaleInfo[]>(this.salesUrl);
  }

  findById(id: number): Observable<SaleInfo> {
    return this.http.get<SaleInfo>(`${this.salesUrl}/${id}`);
  }

  findByCustomerId(customerId: number): Observable<SaleInfo[]> {
    return this.http.get<SaleInfo[]>(`${this.salesUrl}/customer/${customerId}`);
  }

  findByEmployeeId(employeeId: number): Observable<SaleInfo[]> {
    return this.http.get<SaleInfo[]>(`${this.salesUrl}/employee/${employeeId}`);
  }

  findByDateRange(startDate: string, endDate: string): Observable<SaleInfo[]> {
    return this.http.get<SaleInfo[]>(`${this.salesUrl}/date-range`, {
      params: { startDate, endDate },
    });
  }

  findByStatus(status: string): Observable<SaleInfo[]> {
    return this.http.get<SaleInfo[]>(`${this.salesUrl}/status/${status}`);
  }

  create(saleData: SaleData): Observable<SaleInfo> {
    return this.http.post<SaleInfo>(this.salesUrl, saleData);
  }

  update(id: number, saleData: Partial<SaleData>): Observable<SaleInfo> {
    return this.http.put<SaleInfo>(`${this.salesUrl}/${id}`, saleData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.salesUrl}/${id}`);
  }

  cancelSale(id: number): Observable<SaleInfo> {
    return this.http.put<SaleInfo>(`${this.salesUrl}/${id}/cancel`, {});
  }

  returnSale(id: number, fullReturn = true): Observable<SaleInfo> {
    return this.http.put<SaleInfo>(`${this.salesUrl}/${id}/return`, {
      fullReturn,
    });
  }
}
