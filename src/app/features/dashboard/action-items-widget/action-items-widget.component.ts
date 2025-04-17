import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { TooltipModule } from 'primeng/tooltip';

interface ActionItem {
  id: number;
  title: string;
  description: string;
  date: Date;
  type: 'inventory' | 'sales' | 'supplier' | 'customer';
  priority: 'high' | 'medium' | 'low';
  route: string;
  dueDate: Date;
  completed: boolean;
}

@Component({
  selector: 'app-action-items-widget',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TimelineModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './action-items-widget.component.html',
  styleUrl: './action-items-widget.component.css',
})
export class ActionItemsWidgetComponent {
  actionItems: ActionItem[] = [
    {
      id: 1,
      title: 'Realizar pedido de cuadernos',
      description:
        'Contactar al proveedor para realizar pedido de reposición de cuadernos argollados',
      date: new Date(),
      type: 'supplier',
      priority: 'high',
      route: '/proveedores/pedidos/pendientes',
      dueDate: new Date('2023-09-30'),
      completed: false,
    },
    {
      id: 2,
      title: 'Actualizar precios de papelería',
      description:
        'Actualizar los precios de productos de papelería según la nueva lista de precios',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      type: 'supplier',
      priority: 'medium',
      route: '/finanzas/facturas-pendientes',
      dueDate: new Date('2023-10-05'),
      completed: false,
    },
    {
      id: 3,
      title: 'Revisar inventario de lápices',
      description:
        'Verificar el inventario físico de lápices y actualizar en el sistema',
      date: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      type: 'inventory',
      priority: 'low',
      route: '/inventario',
      dueDate: new Date('2023-10-10'),
      completed: false,
    },
    {
      id: 4,
      title: 'Contactar cliente por pedido pendiente',
      description: 'Llamar al cliente para confirmar detalles del pedido #1234',
      date: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
      type: 'customer',
      priority: 'high',
      route: '/clientes/cotizaciones',
      dueDate: new Date('2023-09-28'),
      completed: false,
    },
  ];

  constructor(private router: Router) {}

  completeAction(actionId: number): void {
    const actionIndex = this.actionItems.findIndex(
      (item) => item.id === actionId,
    );
    if (actionIndex !== -1) {
      this.actionItems[actionIndex].completed = true;
      // In a real application, you would call a service to update the status
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  navigateToActionsList(): void {
    this.router.navigate(['/acciones']);
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'inventory':
        return 'pi pi-box';
      case 'sales':
        return 'pi pi-shopping-cart';
      case 'supplier':
        return 'pi pi-truck';
      case 'customer':
        return 'pi pi-user';
      default:
        return 'pi pi-check';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Hace un momento';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    }

    return date.toLocaleDateString('es-CO');
  }

  get pendingActionsCount(): number {
    return this.actionItems.filter((item) => !item.completed).length;
  }

  getSeverity(
    priority: string,
  ):
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast'
    | undefined {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warn';
      case 'low':
        return 'info';
      default:
        return 'info';
    }
  }
}
