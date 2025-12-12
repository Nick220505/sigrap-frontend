import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductData, ProductInfo } from '../models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<ProductInfo[]> {
    return this.http.get<ProductInfo[]>('/products');
  }

  findById(id: number): Observable<ProductInfo> {
    return this.http.get<ProductInfo>(`/products/${id}`);
  }

  create(productData: ProductData): Observable<ProductInfo> {
    return this.http.post<ProductInfo>('/products', productData);
  }

  update(
    id: number,
    productData: Partial<ProductData>,
  ): Observable<ProductInfo> {
    return this.http.put<ProductInfo>(`/products/${id}`, productData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/products/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>('delete', '/products/delete-many', {
      body: ids,
    });
  }
}
