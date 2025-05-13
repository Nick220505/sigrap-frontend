import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { SupplierData, SupplierInfo } from '../models/supplier.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private readonly http = inject(HttpClient);
  private readonly suppliersUrl = `${environment.apiUrl}/suppliers`;

  findAll(): Observable<SupplierInfo[]> {
    return this.http.get<SupplierInfo[]>(this.suppliersUrl);
  }

  findById(id: number): Observable<SupplierInfo> {
    return this.http.get<SupplierInfo>(`${this.suppliersUrl}/${id}`);
  }

  create(supplierData: SupplierData): Observable<SupplierInfo> {
    return this.http.post<SupplierInfo>(this.suppliersUrl, supplierData);
  }

  update(
    id: number,
    supplierData: Partial<SupplierData>,
  ): Observable<SupplierInfo> {
    return this.http.put<SupplierInfo>(
      `${this.suppliersUrl}/${id}`,
      supplierData,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.suppliersUrl}/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>(
      'delete',
      `${this.suppliersUrl}/delete-many`,
      { body: ids },
    );
  }
}
