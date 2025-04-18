import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuItemComponent } from './menu-item/menu-item.component';

@Component({
  selector: 'app-menu',
  imports: [MenuItemComponent, RouterModule],
  template: `
    <ul class="layout-menu">
      @for (menuItem of menuItems; track menuItem; let i = $index) {
        @if (menuItem.separator) {
          <li class="menu-separator"></li>
        } @else {
          <li
            app-menuitem
            [item]="menuItem"
            [index]="i"
            [root]="true"
            [parentKey]="''"
          ></li>
        }
      }
    </ul>
  `,
})
export class MenuComponent {
  menuItems: MenuItem[] = [
    {
      label: 'PRINCIPAL',
      items: [
        {
          label: 'Dashboard',
          icon: 'pi pi-fw pi-home',
          routerLink: ['/dashboard'],
        },
      ],
    },
    {
      label: 'GESTIÓN DE INVENTARIO',
      items: [
        {
          label: 'Productos',
          icon: 'pi pi-fw pi-box',
          routerLink: ['/products'],
        },
        {
          label: 'Categorías',
          icon: 'pi pi-fw pi-tags',
          routerLink: ['/categories'],
        },
        {
          label: 'Stock',
          icon: 'pi pi-fw pi-database',
          routerLink: ['/stock'],
        },
        {
          label: 'Alertas',
          icon: 'pi pi-fw pi-exclamation-triangle',
          routerLink: ['/alerts'],
        },
      ],
    },
    {
      label: 'VENTAS',
      items: [
        {
          label: 'Registrar Venta',
          icon: 'pi pi-fw pi-shopping-cart',
          routerLink: ['/sales/register'],
        },
        {
          label: 'Historial de Ventas',
          icon: 'pi pi-fw pi-history',
          routerLink: ['/sales/history'],
        },
        {
          label: 'Devoluciones',
          icon: 'pi pi-fw pi-refresh',
          routerLink: ['/sales/returns'],
        },
        {
          label: 'Descuentos',
          icon: 'pi pi-fw pi-percentage',
          routerLink: ['/sales/discounts'],
        },
      ],
    },
    {
      label: 'PROVEEDORES',
      items: [
        {
          label: 'Catálogo',
          icon: 'pi pi-fw pi-book',
          routerLink: ['/suppliers/catalog'],
        },
        {
          label: 'Pedidos',
          icon: 'pi pi-fw pi-send',
          routerLink: ['/suppliers/orders'],
        },
        {
          label: 'Pagos',
          icon: 'pi pi-fw pi-wallet',
          routerLink: ['/suppliers/payments'],
        },
        {
          label: 'Seguimiento',
          icon: 'pi pi-fw pi-map-marker',
          routerLink: ['/suppliers/tracking'],
        },
      ],
    },
    {
      label: 'CLIENTES',
      items: [
        {
          label: 'Registro',
          icon: 'pi pi-fw pi-user-plus',
          routerLink: ['/customers/register'],
        },
        {
          label: 'Historial',
          icon: 'pi pi-fw pi-history',
          routerLink: ['/customers/history'],
        },
        {
          label: 'Ranking',
          icon: 'pi pi-fw pi-star',
          routerLink: ['/customers/ranking'],
        },
      ],
    },
    {
      label: 'EMPLEADOS',
      items: [
        {
          label: 'Rendimiento',
          icon: 'pi pi-fw pi-chart-line',
          routerLink: ['/employees/performance'],
        },
        {
          label: 'Horarios',
          icon: 'pi pi-fw pi-calendar',
          routerLink: ['/employees/schedule'],
        },
        {
          label: 'Seguimiento',
          icon: 'pi pi-fw pi-eye',
          routerLink: ['/employees/tracking'],
        },
      ],
    },
    {
      label: 'REPORTES',
      items: [
        {
          label: 'Ventas',
          icon: 'pi pi-fw pi-chart-bar',
          routerLink: ['/reports/sales'],
        },
        {
          label: 'Inventario',
          icon: 'pi pi-fw pi-list',
          routerLink: ['/reports/inventory'],
        },
        {
          label: 'Financieros',
          icon: 'pi pi-fw pi-dollar',
          routerLink: ['/reports/financial'],
        },
        {
          label: 'Desempeño',
          icon: 'pi pi-fw pi-chart-line',
          routerLink: ['/reports/performance'],
        },
      ],
    },
    {
      label: 'CONFIGURACIÓN',
      items: [
        {
          label: 'Usuarios',
          icon: 'pi pi-fw pi-users',
          routerLink: ['/settings/users'],
        },
        {
          label: 'Perfiles',
          icon: 'pi pi-fw pi-id-card',
          routerLink: ['/settings/profiles'],
        },
        {
          label: 'Auditoría',
          icon: 'pi pi-fw pi-shield',
          routerLink: ['/settings/audit'],
        },
        {
          label: 'Notificaciones',
          icon: 'pi pi-fw pi-bell',
          routerLink: ['/settings/notifications'],
        },
      ],
    },
  ];
}
