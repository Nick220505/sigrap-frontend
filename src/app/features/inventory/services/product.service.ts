import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { ProductData, ProductInfo } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly productsUrl = `${environment.apiUrl}/products`;

  findAll(): Observable<ProductInfo[]> {
    return this.http.get<ProductInfo[]>(this.productsUrl);
  }

  findById(id: number): Observable<ProductInfo> {
    return this.http.get<ProductInfo>(`${this.productsUrl}/${id}`);
  }

  create(productData: ProductData): Observable<ProductInfo> {
    return this.http.post<ProductInfo>(this.productsUrl, productData);
  }

  update(
    id: number,
    productData: Partial<ProductData>,
  ): Observable<ProductInfo> {
    return this.http.put<ProductInfo>(`${this.productsUrl}/${id}`, productData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.productsUrl}/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>(
      'delete',
      `${this.productsUrl}/delete-many`,
      { body: ids },
    );
  }
}
