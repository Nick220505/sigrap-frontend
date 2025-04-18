import { Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
  selector: 'app-menu',
  imports: [MenuItemComponent, RouterModule],
  template: `
    <ul class="layout-menu">
      @for (item of model; track item; let i = $index) {
        @if (item.separator) {
          <li class="menu-separator"></li>
        } @else {
          <li
            app-menuitem
            [item]="item"
            [index]="i"
            [root]="true"
            [parentKey]="''"
          ></li>
        }
      }
    </ul>
  `,
})
export class MenuComponent implements OnInit {
  model: MenuItem[] = [];

  ngOnInit() {
    this.model = [
      {
        label: 'Principal',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-chart-line',
            routerLink: ['/dashboard'],
          },
        ],
      },
      {
        label: 'Gestión',
        items: [
          {
            label: 'Ventas',
            icon: 'pi pi-fw pi-shopping-cart',
            routerLink: ['/sales'],
          },
          {
            label: 'Productos',
            icon: 'pi pi-fw pi-box',
            routerLink: ['/products'],
          },
          {
            label: 'Inventario',
            icon: 'pi pi-fw pi-database',
            routerLink: ['/inventory'],
          },
          {
            label: 'Clientes',
            icon: 'pi pi-fw pi-users',
            routerLink: ['/customers'],
          },
          {
            label: 'Proveedores',
            icon: 'pi pi-fw pi-truck',
            routerLink: ['/suppliers'],
          },
        ],
      },
      {
        label: 'Administración',
        items: [
          {
            label: 'Usuarios',
            icon: 'pi pi-fw pi-user',
            routerLink: ['/users'],
          },
          {
            label: 'Reportes',
            icon: 'pi pi-fw pi-file-pdf',
            routerLink: ['/reports'],
          },
        ],
      },
    ];
  }
}
