import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { TooltipModule } from 'primeng/tooltip';

interface AuditLog {
  id: number;
  action: string;
  description: string;
  user: string;
  date: Date;
  type: 'inventory' | 'sales' | 'system' | 'user' | 'finance';
}

@Component({
  selector: 'app-audit-activity-widget',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TimelineModule,
    TooltipModule,
  ],
  templateUrl: './audit-activity-widget.component.html',
  styleUrl: './audit-activity-widget.component.css',
})
export class AuditActivityWidgetComponent {
  auditLogs: AuditLog[] = [
    {
      id: 1,
      action: 'Actualización de Inventario',
      description:
        'Se actualizó el stock de "Cuaderno Argollado" de 5 a 2 unidades',
      user: 'Carlos Rodríguez',
      date: new Date(),
      type: 'inventory',
    },
    {
      id: 2,
      action: 'Venta Registrada',
      description: 'Venta #A1234 por $156,000 completada',
      user: 'Ana Martínez',
      date: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      type: 'sales',
    },
    {
      id: 3,
      action: 'Nuevo Usuario',
      description: 'Se creó la cuenta de usuario para "Laura Sánchez"',
      user: 'Admin',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: 'user',
    },
    {
      id: 4,
      action: 'Respaldo del Sistema',
      description: 'Respaldo automático de la base de datos completado',
      user: 'Sistema',
      date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      type: 'system',
    },
    {
      id: 5,
      action: 'Pago a Proveedor',
      description: 'Pago de $1,250,000 al proveedor "Distribuidora Nacional"',
      user: 'Jorge González',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      type: 'finance',
    },
  ];

  constructor(private router: Router) {}

  navigateToAuditLog(): void {
    this.router.navigate(['/sistema/auditoria']);
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'inventory':
        return 'pi pi-box';
      case 'sales':
        return 'pi pi-shopping-cart';
      case 'user':
        return 'pi pi-user';
      case 'system':
        return 'pi pi-cog';
      case 'finance':
        return 'pi pi-dollar';
      default:
        return 'pi pi-info-circle';
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'inventory':
        return 'bg-blue-100 text-blue-600';
      case 'sales':
        return 'bg-green-100 text-green-600';
      case 'user':
        return 'bg-purple-100 text-purple-600';
      case 'system':
        return 'bg-gray-100 text-gray-600';
      case 'finance':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
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
}
