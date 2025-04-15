import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable()
export class IconService {
  private readonly http = inject(HttpClient);

  icons!: any[];

  selectedIcon: any;

  apiUrl = 'assets/demo/data/icons.json';

  getIcons() {
    return this.http.get(this.apiUrl).pipe(
      map((response: any) => {
        this.icons = response.icons;
        return this.icons;
      }),
    );
  }
}
