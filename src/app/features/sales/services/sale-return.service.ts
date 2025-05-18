import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env';
import {
  SaleReturnData,
  SaleReturnInfo,
} from '@features/sales/models/sale-return.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaleReturnService {
  private readonly http = inject(HttpClient);
  private readonly saleReturnsUrl = `${environment.apiUrl}/sale-returns`;

  findAll(): Observable<SaleReturnInfo[]> {
    return this.http.get<SaleReturnInfo[]>(this.saleReturnsUrl);
  }

  findById(id: number): Observable<SaleReturnInfo> {
    return this.http.get<SaleReturnInfo>(`${this.saleReturnsUrl}/${id}`);
  }

  findByOriginalSaleId(originalSaleId: number): Observable<SaleReturnInfo[]> {
    return this.http.get<SaleReturnInfo[]>(
      `${this.saleReturnsUrl}/original-sale/${originalSaleId}`,
    );
  }

  create(saleReturnData: SaleReturnData): Observable<SaleReturnInfo> {
    return this.http.post<SaleReturnInfo>(this.saleReturnsUrl, saleReturnData);
  }

  update(
    id: number,
    saleReturnData: Partial<SaleReturnData>,
  ): Observable<SaleReturnInfo> {
    return this.http.put<SaleReturnInfo>(
      `${this.saleReturnsUrl}/${id}`,
      saleReturnData,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.saleReturnsUrl}/${id}`);
  }
}
