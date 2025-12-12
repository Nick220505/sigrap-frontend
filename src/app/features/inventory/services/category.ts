import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryData, CategoryInfo } from '../models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<CategoryInfo[]> {
    return this.http.get<CategoryInfo[]>('/categories');
  }

  findById(id: number): Observable<CategoryInfo> {
    return this.http.get<CategoryInfo>(`/categories/${id}`);
  }

  create(categoryData: CategoryData): Observable<CategoryInfo> {
    return this.http.post<CategoryInfo>('/categories', categoryData);
  }

  update(
    id: number,
    categoryData: Partial<CategoryData>,
  ): Observable<CategoryInfo> {
    return this.http.put<CategoryInfo>(`/categories/${id}`, categoryData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/categories/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>('delete', '/categories/delete-many', {
      body: ids,
    });
  }
}
