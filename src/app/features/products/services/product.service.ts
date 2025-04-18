import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';

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

export interface ProductState {
  data: Product[];
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly productsUrl = 'http://localhost:3000/products';

  readonly productsState = signal<ProductState>({
    data: [],
    loading: false,
    error: null,
  });

  constructor() {
    this.getProducts();
  }

  getProducts(): void {
    this.productsState.update((state) => ({
      ...state,
      loading: true,
      error: null,
    }));

    this.http
      .get<Product[]>(this.productsUrl)
      .pipe(
        finalize(() => {
          this.productsState.update((state) => ({ ...state, loading: false }));
        }),
      )
      .subscribe({
        next: (data) => {
          this.productsState.set({ data, loading: false, error: null });
        },
        error: (err) => {
          const errorMsg = 'Error fetching products';
          console.error(errorMsg, err);
          this.productsState.set({
            data: [],
            loading: false,
            error: errorMsg,
          });
        },
      });
  }

  createProduct(product: Omit<Product, 'id' | 'code'>): void {
    this.productsState.update((state) => ({ ...state, loading: true }));

    const newProduct = {
      ...product,
      code: this.generateId(),
      image: product.image ?? 'product-placeholder.svg',
    };

    this.http
      .post<Product>(this.productsUrl, newProduct)
      .pipe(
        finalize(() => {
          this.productsState.update((state) => ({ ...state, loading: false }));
        }),
      )
      .subscribe({
        next: (createdProduct) => {
          this.productsState.update((state) => ({
            ...state,
            data: [...state.data, createdProduct],
            error: null,
          }));
          this.showSuccess('Éxito', 'Producto Creado');
        },
        error: (err) => {
          const errorMsg = 'Failed to create product';
          console.error(errorMsg, err);
          this.showError('Error', errorMsg);
          this.productsState.update((state) => ({ ...state, error: errorMsg }));
        },
      });
  }

  updateProduct(updatedProduct: Product): void {
    if (!updatedProduct.id) {
      const errorMsg = 'Product ID is required for update';
      console.error(errorMsg);
      this.showError('Error', errorMsg);
      return;
    }

    this.productsState.update((state) => ({ ...state, loading: true }));
    const url = `${this.productsUrl}/${updatedProduct.id}`;

    this.http
      .put<Product>(url, updatedProduct)
      .pipe(
        finalize(() => {
          this.productsState.update((state) => ({ ...state, loading: false }));
        }),
      )
      .subscribe({
        next: (returnedProduct) => {
          this.productsState.update((state) => ({
            ...state,
            data: state.data.map((p) =>
              p.id === returnedProduct.id ? returnedProduct : p,
            ),
            error: null,
          }));
          this.showSuccess('Éxito', 'Producto Actualizado');
        },
        error: (err) => {
          const errorMsg = 'Failed to update product';
          console.error(errorMsg, err);
          this.showError('Error', errorMsg);
          this.productsState.update((state) => ({ ...state, error: errorMsg }));
        },
      });
  }

  deleteProductById(id: string): void {
    this.productsState.update((state) => ({ ...state, loading: true }));
    const url = `${this.productsUrl}/${id}`;

    this.http
      .delete<object>(url)
      .pipe(
        finalize(() => {
          this.productsState.update((state) => ({ ...state, loading: false }));
        }),
      )
      .subscribe({
        next: () => {
          this.productsState.update((state) => ({
            ...state,
            data: state.data.filter((product) => product.id !== id),
            error: null,
          }));
          this.showSuccess('Éxito', 'Producto Eliminado');
        },
        error: (err) => {
          const errorMsg = 'Failed to delete product';
          console.error(errorMsg, err);
          this.showError('Error', errorMsg);
          this.productsState.update((state) => ({ ...state, error: errorMsg }));
        },
      });
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

  private showSuccess(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: 3000,
    });
  }

  private showError(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: 3000,
    });
  }
}
