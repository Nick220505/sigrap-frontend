import { Component, signal } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuItemComponent } from './menu-item/menu-item.component';

@Component({
  selector: 'app-menu',
  imports: [MenuItemComponent, RouterModule],
  template: `
    <ul class="layout-menu">
      @for (menuItem of menuItems(); track menuItem; let i = $index) {
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
  readonly menuItems = signal<MenuItem[]>([
    {
      label: 'PRINCIPAL',
      items: [
        {
          label: 'Panel Principal',
          icon: 'pi pi-fw pi-home',
          routerLink: ['/'],
        },
      ],
    },
    {
      label: 'CONFIGURACIÓN',
      items: [
        {
          label: 'Usuarios',
          icon: 'pi pi-fw pi-users',
          routerLink: ['/configuracion/usuarios'],
        },
        {
          label: 'Auditoría',
          icon: 'pi pi-fw pi-shield',
          routerLink: ['/configuracion/auditoria'],
        },
      ],
    },
    {
      label: 'EMPLEADOS',
      items: [
        {
          label: 'Horarios',
          icon: 'pi pi-fw pi-calendar',
          routerLink: ['/empleados/horarios'],
        },
        {
          label: 'Asistencia',
          icon: 'pi pi-fw pi-eye',
          routerLink: ['/empleados/asistencia'],
        },
        {
          label: 'Rendimiento',
          icon: 'pi pi-fw pi-chart-line',
          routerLink: ['/empleados/rendimiento'],
        },
      ],
    },
    {
      label: 'PROVEEDORES',
      items: [
        {
          label: 'Catálogo',
          icon: 'pi pi-fw pi-book',
          routerLink: ['/proveedores/catalogo'],
        },
        {
          label: 'Pedidos',
          icon: 'pi pi-fw pi-send',
          routerLink: ['/proveedores/pedidos'],
        },
        {
          label: 'Seguimiento',
          icon: 'pi pi-fw pi-map-marker',
          routerLink: ['/proveedores/seguimiento'],
        },
        {
          label: 'Pagos',
          icon: 'pi pi-fw pi-wallet',
          routerLink: ['/proveedores/pagos'],
        },
      ],
    },
    {
      label: 'INVENTARIO',
      items: [
        {
          label: 'Categorías',
          icon: 'pi pi-fw pi-tags',
          routerLink: ['/inventario/categorias'],
        },
        {
          label: 'Productos',
          icon: 'pi pi-fw pi-box',
          routerLink: ['/inventario/productos'],
        },
        {
          label: 'Stock',
          icon: 'pi pi-fw pi-database',
          routerLink: ['/inventario'],
        },
        {
          label: 'Alertas',
          icon: 'pi pi-fw pi-exclamation-triangle',
          routerLink: ['/alertas'],
        },
      ],
    },
    {
      label: 'CLIENTES',
      items: [
        {
          label: 'Registro',
          icon: 'pi pi-fw pi-user-plus',
          routerLink: ['/clientes/registro'],
        },
        {
          label: 'Historial',
          icon: 'pi pi-fw pi-history',
          routerLink: ['/clientes/historial'],
        },
        {
          label: 'Ranking',
          icon: 'pi pi-fw pi-star',
          routerLink: ['/clientes/ranking'],
        },
      ],
    },
    {
      label: 'VENTAS',
      items: [
        {
          label: 'Registrar Venta',
          icon: 'pi pi-fw pi-shopping-cart',
          routerLink: ['/ventas/registrar'],
        },
        {
          label: 'Historial de Ventas',
          icon: 'pi pi-fw pi-history',
          routerLink: ['/ventas/historial'],
        },
        {
          label: 'Devoluciones',
          icon: 'pi pi-fw pi-refresh',
          routerLink: ['/ventas/devoluciones'],
        },
        {
          label: 'Descuentos',
          icon: 'pi pi-fw pi-percentage',
          routerLink: ['/ventas/descuentos'],
        },
      ],
    },
    {
      label: 'REPORTES',
      items: [
        {
          label: 'Ventas',
          icon: 'pi pi-fw pi-chart-bar',
          routerLink: ['/reportes/ventas'],
        },
        {
          label: 'Inventario',
          icon: 'pi pi-fw pi-list',
          routerLink: ['/reportes/inventario'],
        },
        {
          label: 'Clientes',
          icon: 'pi pi-fw pi-users',
          routerLink: ['/reportes/clientes'],
        },
        {
          label: 'Financieros',
          icon: 'pi pi-fw pi-dollar',
          routerLink: ['/reportes/financieros'],
        },
        {
          label: 'Desempeño',
          icon: 'pi pi-fw pi-chart-line',
          routerLink: ['/reportes/desempeno'],
        },
      ],
    },
  ]);
}
