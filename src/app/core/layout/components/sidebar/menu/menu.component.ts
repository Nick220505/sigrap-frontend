import { Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuItemComponent } from './menu-item/menu-item.component';

@Component({
  selector: 'app-menu',
  imports: [MenuItemComponent, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
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
            icon: 'pi pi-fw pi-home',
            routerLink: ['/'],
          },
        ],
      },
      {
        label: 'Gestión de Inventario',
        items: [
          {
            label: 'Productos',
            icon: 'pi pi-fw pi-box',
            routerLink: ['/inventario/productos'],
          },
          {
            label: 'Categorías',
            icon: 'pi pi-fw pi-tags',
            routerLink: ['/inventario/categorias'],
          },
          {
            label: 'Stock',
            icon: 'pi pi-fw pi-server',
            routerLink: ['/inventario/stock'],
          },
          {
            label: 'Alertas',
            icon: 'pi pi-fw pi-exclamation-triangle',
            routerLink: ['/inventario/alertas'],
          },
        ],
      },
      {
        label: 'Ventas',
        items: [
          {
            label: 'Punto de Venta',
            icon: 'pi pi-fw pi-shopping-cart',
            routerLink: ['/ventas/punto-venta'],
          },
          {
            label: 'Facturas',
            icon: 'pi pi-fw pi-file',
            routerLink: ['/ventas/facturas'],
          },
          {
            label: 'Pedidos',
            icon: 'pi pi-fw pi-list',
            routerLink: ['/ventas/pedidos'],
          },
          {
            label: 'Devoluciones',
            icon: 'pi pi-fw pi-reply',
            routerLink: ['/ventas/devoluciones'],
          },
        ],
      },
      {
        label: 'Proveedores',
        items: [
          {
            label: 'Lista de Proveedores',
            icon: 'pi pi-fw pi-briefcase',
            routerLink: ['/proveedores/lista'],
          },
          {
            label: 'Órdenes de Compra',
            icon: 'pi pi-fw pi-send',
            routerLink: ['/proveedores/ordenes-compra'],
          },
          {
            label: 'Pagos',
            icon: 'pi pi-fw pi-wallet',
            routerLink: ['/proveedores/pagos'],
          },
          {
            label: 'Seguimiento',
            icon: 'pi pi-fw pi-truck',
            routerLink: ['/proveedores/seguimiento'],
          },
        ],
      },
      {
        label: 'Clientes',
        items: [
          {
            label: 'Lista de Clientes',
            icon: 'pi pi-fw pi-users',
            routerLink: ['/clientes/lista'],
          },
          {
            label: 'Cotizaciones',
            icon: 'pi pi-fw pi-calculator',
            routerLink: ['/clientes/cotizaciones'],
          },
          {
            label: 'Historial',
            icon: 'pi pi-fw pi-list',
            routerLink: ['/clientes/historial'],
          },
        ],
      },
      {
        label: 'Empleados',
        items: [
          {
            label: 'Rendimiento',
            icon: 'pi pi-fw pi-chart-line',
            routerLink: ['/empleados/rendimiento'],
          },
          {
            label: 'Horarios',
            icon: 'pi pi-fw pi-calendar',
            routerLink: ['/empleados/horarios'],
          },
          {
            label: 'Seguimiento',
            icon: 'pi pi-fw pi-eye',
            routerLink: ['/empleados/seguimiento'],
          },
        ],
      },
      {
        label: 'Reportes',
        items: [
          {
            label: 'Reportes de Ventas',
            icon: 'pi pi-fw pi-chart-bar',
            routerLink: ['/reportes/ventas'],
          },
          {
            label: 'Reportes de Inventario',
            icon: 'pi pi-fw pi-chart-pie',
            routerLink: ['/reportes/inventario'],
          },
          {
            label: 'Financieros',
            icon: 'pi pi-fw pi-dollar',
            routerLink: ['/reportes/financieros'],
          },
        ],
      },
      {
        label: 'Configuración',
        items: [
          {
            label: 'Configuración General',
            icon: 'pi pi-fw pi-cog',
            routerLink: ['/configuracion/general'],
          },
          {
            label: 'Gestión de Usuarios',
            icon: 'pi pi-fw pi-users',
            routerLink: ['/configuracion/usuarios'],
          },
          {
            label: 'Auditoría',
            icon: 'pi pi-fw pi-search',
            routerLink: ['/configuracion/auditoria'],
          },
          {
            label: 'Notificaciones',
            icon: 'pi pi-fw pi-bell',
            routerLink: ['/configuracion/notificaciones'],
          },
        ],
      },
    ];
  }
}
