import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SupplierData, SupplierInfo } from '../models/supplier';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<SupplierInfo[]> {
    return this.http.get<SupplierInfo[]>('/suppliers');
  }

  findById(id: number): Observable<SupplierInfo> {
    return this.http.get<SupplierInfo>(`/suppliers/${id}`);
  }

  create(supplierData: SupplierData): Observable<SupplierInfo> {
    return this.http.post<SupplierInfo>('/suppliers', supplierData);
  }

  update(
    id: number,
    supplierData: Partial<SupplierData>,
  ): Observable<SupplierInfo> {
    return this.http.put<SupplierInfo>(`/suppliers/${id}`, supplierData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/suppliers/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>('delete', '/suppliers/delete-many', {
      body: ids,
    });
  }
}
