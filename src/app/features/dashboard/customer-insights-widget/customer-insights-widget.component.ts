import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

interface CustomerStat {
  label: string;
  value: string;
  colorClass: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  registerDate: Date;
}

@Component({
  selector: 'app-customer-insights-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './customer-insights-widget.component.html',
  styleUrl: './customer-insights-widget.component.css',
})
export class CustomerInsightsWidgetComponent {
  customerStats: CustomerStat[] = [
    {
      label: 'Total',
      value: '856',
      colorClass: 'text-blue-600',
    },
    {
      label: 'Nuevos (Mes)',
      value: '42',
      colorClass: 'text-green-600',
    },
    {
      label: 'Frecuentes',
      value: '64%',
      colorClass: 'text-purple-600',
    },
    {
      label: 'Ticket Promedio',
      value: '$98.5K',
      colorClass: 'text-orange-600',
    },
  ];

  recentCustomers: Customer[] = [
    {
      id: 1,
      name: 'Colegio San José',
      email: 'compras@colegiosanjose.edu.co',
      registerDate: new Date(2023, 8, 25),
    },
    {
      id: 2,
      name: 'María Fernández',
      email: 'maria.fernandez@gmail.com',
      registerDate: new Date(2023, 8, 24),
    },
    {
      id: 3,
      name: 'Papelería Central',
      email: 'compras@papeleriacentral.com.co',
      registerDate: new Date(2023, 8, 22),
    },
    {
      id: 4,
      name: 'Juan Carlos Ramírez',
      email: 'jcramirez@outlook.com',
      registerDate: new Date(2023, 8, 20),
    },
  ];

  constructor(private router: Router) {}

  navigateToCustomers(): void {
    this.router.navigate(['/clientes']);
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
