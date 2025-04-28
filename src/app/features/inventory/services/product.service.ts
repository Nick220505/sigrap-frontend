import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import {
  CreateProductDto,
  Product,
  UpdateProductDto,
} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly productsUrl = `${environment.apiUrl}/products`;

  findAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl);
  }

  findById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.productsUrl}/${id}`);
  }

  create(newProduct: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(this.productsUrl, newProduct);
  }

  update(id: number, productData: UpdateProductDto): Observable<Product> {
    return this.http.put<Product>(`${this.productsUrl}/${id}`, productData);
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
