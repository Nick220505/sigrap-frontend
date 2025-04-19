import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
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

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl);
  }

  create(newProduct: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(this.productsUrl, newProduct);
  }

  update(id: string, productData: UpdateProductDto): Observable<Product> {
    return this.http.put<Product>(`${this.productsUrl}/${id}`, productData);
  }

  delete(id: string): Observable<object> {
    return this.http.delete<object>(`${this.productsUrl}/${id}`);
  }
}
