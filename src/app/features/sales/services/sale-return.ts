import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  SaleReturnData,
  SaleReturnInfo,
} from '@features/sales/models/sale-return';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaleReturnService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<SaleReturnInfo[]> {
    return this.http.get<SaleReturnInfo[]>('/sale-returns');
  }

  findById(id: number): Observable<SaleReturnInfo> {
    return this.http.get<SaleReturnInfo>(`/sale-returns/${id}`);
  }

  findByOriginalSaleId(originalSaleId: number): Observable<SaleReturnInfo[]> {
    return this.http.get<SaleReturnInfo[]>(
      `/sale-returns/original-sale/${originalSaleId}`,
    );
  }

  create(saleReturnData: SaleReturnData): Observable<SaleReturnInfo> {
    return this.http.post<SaleReturnInfo>('/sale-returns', saleReturnData);
  }

  update(
    id: number,
    saleReturnData: Partial<SaleReturnData>,
  ): Observable<SaleReturnInfo> {
    return this.http.put<SaleReturnInfo>(`/sale-returns/${id}`, saleReturnData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/sale-returns/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.delete<void>('/sale-returns/delete-many', {
      body: ids,
    });
  }
}
