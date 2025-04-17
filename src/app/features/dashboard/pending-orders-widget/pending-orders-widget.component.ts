import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

interface PendingOrder {
  id: number;
  customerName: string;
  date: Date;
  total: number;
  status: 'urgent' | 'pending' | 'approved';
  items: number;
}

@Component({
  selector: 'app-pending-orders-widget',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './pending-orders-widget.component.html',
  styleUrl: './pending-orders-widget.component.css',
})
export class PendingOrdersWidgetComponent {
  pendingOrders: PendingOrder[] = [
    {
      id: 1001,
      customerName: 'Colegio San José',
      date: new Date(2023, 8, 25),
      total: 1250000,
      status: 'urgent',
      items: 5,
    },
    {
      id: 1002,
      customerName: 'Librería Central',
      date: new Date(2023, 8, 27),
      total: 780000,
      status: 'pending',
      items: 12,
    },
    {
      id: 1003,
      customerName: 'Universidad Nacional',
      date: new Date(2023, 8, 28),
      total: 2450000,
      status: 'pending',
      items: 8,
    },
    {
      id: 1004,
      customerName: 'Papelería El Estudiante',
      date: new Date(2023, 8, 29),
      total: 560000,
      status: 'approved',
      items: 6,
    },
  ];

  constructor(private router: Router) {}

  navigateToOrders(): void {
    this.router.navigate(['/ventas/pedidos']);
  }

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/ventas/pedidos', orderId]);
  }

  approveOrder(orderId: number): void {
    const orderIndex = this.pendingOrders.findIndex(
      (order) => order.id === orderId,
    );
    if (orderIndex !== -1) {
      this.pendingOrders[orderIndex].status = 'approved';
      // In a real application, you would call a service to update the status
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'urgent':
        return 'Urgente';
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      default:
        return status;
    }
  }

  getSeverity(
    status: string,
  ):
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast'
    | undefined {
    switch (status) {
      case 'urgent':
        return 'danger';
      case 'pending':
        return 'warn';
      case 'approved':
        return 'success';
      default:
        return 'info';
    }
  }
}
