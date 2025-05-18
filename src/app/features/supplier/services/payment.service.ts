import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { PaymentData, PaymentInfo } from '../models/payment.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly paymentsUrl = `${environment.apiUrl}/payments`;

  findAll(): Observable<PaymentInfo[]> {
    return this.http.get<PaymentInfo[]>(this.paymentsUrl);
  }

  findById(id: number): Observable<PaymentInfo> {
    return this.http.get<PaymentInfo>(`${this.paymentsUrl}/${id}`);
  }

  create(paymentData: PaymentData): Observable<PaymentInfo> {
    return this.http.post<PaymentInfo>(this.paymentsUrl, paymentData);
  }

  update(id: number, paymentData: PaymentData): Observable<PaymentInfo> {
    return this.http.put<PaymentInfo>(`${this.paymentsUrl}/${id}`, paymentData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.paymentsUrl}/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>(
      'delete',
      `${this.paymentsUrl}/delete-many`,
      { body: ids },
    );
  }

  findBySupplier(supplierId: number): Observable<PaymentInfo[]> {
    return this.http.get<PaymentInfo[]>(
      `${this.paymentsUrl}/supplier/${supplierId}`,
    );
  }
}
