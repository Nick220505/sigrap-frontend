import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Icon {
  properties: {
    name: string;
    id: string;
    order: number;
    prevSize: number;
    code: number;
    [key: string]: string | number;
  };
  icon: {
    paths: string[];
    attrs: unknown[];
    isMulticolor: boolean;
    isMulticolor2: boolean;
    grid: number;
    tags: string[];
  };
}

interface IconsResponse {
  icons: Icon[];
}

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private readonly http = inject(HttpClient);

  icons: Icon[] = [];

  selectedIcon: Icon | null = null;

  apiUrl = 'assets/demo/data/icons.json';

  getIcons(): Observable<Icon[]> {
    return this.http.get<IconsResponse>(this.apiUrl).pipe(
      map((response) => {
        this.icons = response.icons;
        return this.icons;
      }),
    );
  }
}
