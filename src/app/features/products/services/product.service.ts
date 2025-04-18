import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';

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

  readonly products = signal<Product[]>([]);

  constructor() {
    this.getProducts().subscribe({
      error: (err) => console.error('Error loading initial products:', err),
    });
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl).pipe(
      tap((data) => this.products.set(data)),
      catchError((err) => {
        console.error('Error fetching products:', err);
        return of([]);
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
      tap((createdProduct) => {
        this.products.update((currentProducts) => [
          ...currentProducts,
          createdProduct,
        ]);
      }),
      catchError((err) => {
        console.error('Error creating product:', err);
        return throwError(() => new Error('Failed to create product'));
      }),
    );
  }

  updateProduct(updatedProduct: Product): Observable<Product> {
    if (!updatedProduct.id) {
      return throwError(() => new Error('Product ID is required for update'));
    }
    const url = `${this.productsUrl}/${updatedProduct.id}`;
    return this.http.put<Product>(url, updatedProduct).pipe(
      tap((returnedProduct) => {
        this.products.update((currentProducts) =>
          currentProducts.map((p) =>
            p.id === returnedProduct.id ? returnedProduct : p,
          ),
        );
      }),
      catchError((err) => {
        console.error('Error updating product:', err);
        return throwError(() => new Error('Failed to update product'));
      }),
    );
  }

  deleteProductById(id: string): Observable<object> {
    const url = `${this.productsUrl}/${id}`;
    return this.http.delete<object>(url).pipe(
      tap(() => {
        this.products.update((currentProducts) =>
          currentProducts.filter((product) => product.id !== id),
        );
      }),
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
