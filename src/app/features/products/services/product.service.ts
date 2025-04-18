import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly productsUrl = 'http://localhost:3000/products';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl);
  }

  createProduct(newProduct: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.productsUrl, newProduct);
  }

  updateProduct(
    id: string,
    productData: Omit<Product, 'id'>,
  ): Observable<Product> {
    return this.http.put<Product>(`${this.productsUrl}/${id}`, productData);
  }

  deleteProductById(id: string): Observable<object> {
    return this.http.delete<object>(`${this.productsUrl}/${id}`);
  }
}
