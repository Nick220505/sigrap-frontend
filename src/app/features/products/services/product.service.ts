import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

export interface Product {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  inventoryStatus?: string;
  category?: string;
  image?: string;
  rating?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly productsUrl = 'http://localhost:3000/products';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl).pipe(
      catchError((err) => {
        console.error('Error fetching products:', err);
        return throwError(() => new Error('Failed to fetch products'));
      }),
    );
  }

  createProduct(product: Omit<Product, 'id' | 'code'>): Observable<Product> {
    const newProduct = {
      ...product,
      code: this.generateId(),
      image: product.image ?? 'product-placeholder.svg',
    };
    return this.http.post<Product>(this.productsUrl, newProduct).pipe(
      catchError((err) => {
        console.error('Error creating product:', err);
        return throwError(() => new Error('Failed to create product'));
      }),
    );
  }

  updateProduct(updatedProduct: Product): Observable<Product> {
    if (!updatedProduct.id) {
      console.error('Product ID is required for update');
      return throwError(() => new Error('Product ID is required for update'));
    }
    const url = `${this.productsUrl}/${updatedProduct.id}`;
    return this.http.put<Product>(url, updatedProduct).pipe(
      catchError((err) => {
        console.error('Error updating product:', err);
        return throwError(() => new Error('Failed to update product'));
      }),
    );
  }

  deleteProductById(id: string): Observable<object> {
    const url = `${this.productsUrl}/${id}`;
    return this.http.delete<object>(url).pipe(
      catchError((err) => {
        console.error('Error deleting product:', err);
        return throwError(() => new Error('Failed to delete product'));
      }),
    );
  }

  private generateId(): string {
    let id = '';
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }
}
