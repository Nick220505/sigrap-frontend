import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { SaleData, SaleInfo } from '../models/sale';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<SaleInfo[]> {
    return this.http.get<SaleInfo[]>('/sales');
  }

  findById(id: number): Observable<SaleInfo> {
    return this.http.get<SaleInfo>(`/sales/${id}`);
  }

  findByCustomerId(customerId: number): Observable<SaleInfo[]> {
    return this.http.get<SaleInfo[]>(`/sales/customer/${customerId}`);
  }

  findByEmployeeId(employeeId: number): Observable<SaleInfo[]> {
    return this.http.get<SaleInfo[]>(`/sales/employee/${employeeId}`);
  }

  findByDateRange(startDate: string, endDate: string): Observable<SaleInfo[]> {
    return this.http.get<SaleInfo[]>('/sales/by-date-range', {
      params: { startDate, endDate },
    });
  }

  create(saleData: SaleData): Observable<SaleInfo> {
    return this.http.post<SaleInfo>('/sales', saleData);
  }

  update(id: number, saleData: Partial<SaleData>): Observable<SaleInfo> {
    return this.http.put<SaleInfo>(`/sales/${id}`, saleData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/sales/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.delete<void>('/sales/delete-many', {
      body: ids,
    });
  }

  generateDailySalesReport(
    date?: Date,
    exportPath?: string,
  ): Observable<string> {
    let params = new HttpParams();

    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      params = params.append('date', formattedDate);
    }

    if (exportPath) {
      params = params.append('exportPath', exportPath);
    }

    if (exportPath === 'AUTO') {
      return this.http
        .get('/sales/export/daily', {
          params,
          responseType: 'blob',
          observe: 'response',
        })
        .pipe(
          tap((response: HttpResponse<Blob>) => {
            const blob = response.body;
            if (!blob) {
              return;
            }

            const contentDisposition = response.headers.get(
              'Content-Disposition',
            );
            let filename = 'sales-report.txt';

            if (contentDisposition) {
              const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
                contentDisposition,
              );
              if (matches?.[1]) {
                filename = matches[1].replace(/['"]/g, '');
              }
            }

            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            link.click();

            URL.revokeObjectURL(downloadUrl);
          }),
          map(() => `Downloaded file successfully`),
        );
    } else {
      return this.http.get<string>('/sales/export/daily', { params });
    }
  }
}
