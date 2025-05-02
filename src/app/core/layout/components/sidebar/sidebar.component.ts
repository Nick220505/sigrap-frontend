import { Component } from '@angular/core';
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-sidebar',
  imports: [MenuComponent],
  template: `
    <div class="layout-sidebar">
      <app-menu />
    </div>
  `,
})
export class SidebarComponent {}
