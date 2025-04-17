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
            icon: 'pi pi-fw pi-reply',
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
        label: 'Proveedores',
        items: [
          {
            label: 'Catálogo',
            icon: 'pi pi-fw pi-briefcase',
            routerLink: ['/proveedores/catalogo'],
          },
          {
            label: 'Pedidos',
            icon: 'pi pi-fw pi-send',
            routerLink: ['/proveedores/pedidos'],
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
            label: 'Registro',
            icon: 'pi pi-fw pi-user-plus',
            routerLink: ['/clientes/registro'],
          },
          {
            label: 'Historial',
            icon: 'pi pi-fw pi-list',
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
            label: 'Ventas',
            icon: 'pi pi-fw pi-chart-bar',
            routerLink: ['/reportes/ventas'],
          },
          {
            label: 'Inventario',
            icon: 'pi pi-fw pi-chart-pie',
            routerLink: ['/reportes/inventario'],
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
      {
        label: 'Configuración',
        items: [
          {
            label: 'Usuarios',
            icon: 'pi pi-fw pi-users',
            routerLink: ['/configuracion/usuarios'],
          },
          {
            label: 'Perfiles',
            icon: 'pi pi-fw pi-id-card',
            routerLink: ['/configuracion/perfiles'],
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
