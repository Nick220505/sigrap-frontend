import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

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
  private readonly productsUrl = 'http://localhost:3000/products'; // URL for json-server

  // Public signal to hold the products state
  readonly products = signal<Product[]>([]);

  constructor() {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.http
      .get<Product[]>(this.productsUrl)
      .pipe(tap((data) => this.products.set(data)))
      .subscribe({
        error: (err) => console.error('Error loading products:', err),
      });
  }

  // Method to manually trigger a refresh if needed
  getProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(this.productsUrl)
      .pipe(tap((data) => this.products.set(data)));
  }

  // No getProductById needed, can compute from the signal if required
  // getProductById(id: string) { ... }

  createProduct(product: Omit<Product, 'id' | 'code'>): Observable<Product> {
    // Generate code locally for the mock server
    const newProduct = {
      ...product,
      code: this.generateId(),
      image: product.image ?? 'product-placeholder.svg',
    };
    // json-server will generate the 'id'
    return this.http.post<Product>(this.productsUrl, newProduct).pipe(
      tap((createdProduct) => {
        // Update the signal optimistically or after confirmation
        this.products.update((products) => [...products, createdProduct]);
      }),
    );
  }

  updateProduct(updatedProduct: Product): Observable<Product> {
    if (!updatedProduct.id) {
      throw new Error('Product ID is required for update');
    }
    const url = `${this.productsUrl}/${updatedProduct.id}`;
    return this.http.put<Product>(url, updatedProduct).pipe(
      tap((returnedProduct) => {
        this.products.update((products) =>
          products.map((p) =>
            p.id === returnedProduct.id ? returnedProduct : p,
          ),
        );
      }),
    );
  }

  deleteProductById(id: string): Observable<object> {
    const url = `${this.productsUrl}/${id}`;
    return this.http.delete<object>(url).pipe(
      tap(() => {
        // Update the signal after successful deletion
        this.products.update((products) =>
          products.filter((product) => product.id !== id),
        );
      }),
    );
  }

  // Keep generateId for creating new product codes before sending to server
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
