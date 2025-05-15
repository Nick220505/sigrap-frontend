import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { CustomerData, CustomerInfo } from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly customersUrl = `${environment.apiUrl}/customers`;

  findAll(): Observable<CustomerInfo[]> {
    return this.http.get<CustomerInfo[]>(this.customersUrl);
  }

  findById(id: number): Observable<CustomerInfo> {
    return this.http.get<CustomerInfo>(`${this.customersUrl}/${id}`);
  }

  create(customerData: CustomerData): Observable<CustomerInfo> {
    return this.http.post<CustomerInfo>(this.customersUrl, customerData);
  }

  update(id: number, customerData: CustomerData): Observable<CustomerInfo> {
    return this.http.put<CustomerInfo>(
      `${this.customersUrl}/${id}`,
      customerData,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.customersUrl}/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>(
      'delete',
      `${this.customersUrl}/delete-many`,
      { body: ids },
    );
  }
}
