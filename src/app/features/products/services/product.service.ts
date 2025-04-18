import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Product {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  inventoryStatus?: string;
  category?: string;
  rating?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly productsUrl = 'http://localhost:3000/products';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl);
  }

  createProduct(newProduct: Omit<Product, 'id' | 'code'>): Observable<Product> {
    return this.http.post<Product>(this.productsUrl, newProduct);
  }

  updateProduct(updatedProduct: Product): Observable<Product> {
    return this.http.put<Product>(
      `${this.productsUrl}/${updatedProduct.id}`,
      updatedProduct,
    );
  }

  deleteProductById(id: string): Observable<object> {
    return this.http.delete<object>(`${this.productsUrl}/${id}`);
  }
}
