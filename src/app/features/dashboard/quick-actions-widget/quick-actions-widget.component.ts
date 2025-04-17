import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-quick-actions-widget',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TooltipModule],
  templateUrl: './quick-actions-widget.component.html',
  styleUrl: './quick-actions-widget.component.css',
})
export class QuickActionsWidgetComponent {
  quickActions = [
    {
      label: 'Nueva Venta',
      icon: 'pi pi-shopping-cart',
      route: '/ventas/registrar',
      color: 'var(--primary-color)',
      tooltip: 'Registrar una nueva venta',
    },
    {
      label: 'Agregar Producto',
      icon: 'pi pi-box',
      route: '/inventario/productos/nuevo',
      color: 'var(--orange-500)',
      tooltip: 'Agregar un nuevo producto al inventario',
    },
    {
      label: 'Nuevo Cliente',
      icon: 'pi pi-user-plus',
      route: '/clientes/registro',
      color: 'var(--teal-500)',
      tooltip: 'Registrar un nuevo cliente',
    },
    {
      label: 'Crear Pedido',
      icon: 'pi pi-truck',
      route: '/proveedores/pedidos/nuevo',
      color: 'var(--indigo-500)',
      tooltip: 'Crear un nuevo pedido a proveedor',
    },
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
