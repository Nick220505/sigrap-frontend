import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { CategoryData, CategoryInfo } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly categoriesUrl = `${environment.apiUrl}/categories`;

  findAll(): Observable<CategoryInfo[]> {
    return this.http.get<CategoryInfo[]>(this.categoriesUrl);
  }

  findById(id: number): Observable<CategoryInfo> {
    return this.http.get<CategoryInfo>(`${this.categoriesUrl}/${id}`);
  }

  create(categoryData: CategoryData): Observable<CategoryInfo> {
    return this.http.post<CategoryInfo>(this.categoriesUrl, categoryData);
  }

  update(
    id: number,
    categoryData: Partial<CategoryData>,
  ): Observable<CategoryInfo> {
    return this.http.put<CategoryInfo>(
      `${this.categoriesUrl}/${id}`,
      categoryData,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.categoriesUrl}/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>(
      'delete',
      `${this.categoriesUrl}/delete-many`,
      { body: ids },
    );
  }
}
