import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerData, CustomerInfo } from '../models/customer';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<CustomerInfo[]> {
    return this.http.get<CustomerInfo[]>('/customers');
  }

  findById(id: number): Observable<CustomerInfo> {
    return this.http.get<CustomerInfo>(`/customers/${id}`);
  }

  create(customerData: CustomerData): Observable<CustomerInfo> {
    return this.http.post<CustomerInfo>('/customers', customerData);
  }

  update(id: number, customerData: CustomerData): Observable<CustomerInfo> {
    return this.http.put<CustomerInfo>(`/customers/${id}`, customerData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/customers/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>('delete', '/customers/delete-many', {
      body: ids,
    });
  }
}
