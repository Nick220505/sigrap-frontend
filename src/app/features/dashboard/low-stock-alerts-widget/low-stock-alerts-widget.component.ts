import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

interface Product {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  status: 'critical' | 'low' | 'normal';
}

@Component({
  selector: 'app-low-stock-alerts-widget',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    BadgeModule,
    ButtonModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './low-stock-alerts-widget.component.html',
  styleUrl: './low-stock-alerts-widget.component.css',
})
export class LowStockAlertsWidgetComponent {
  products: Product[] = [
    {
      id: 1,
      name: 'Cuaderno Argollado',
      category: 'Cuadernos',
      currentStock: 2,
      minStock: 10,
      status: 'critical',
    },
    {
      id: 2,
      name: 'Lápiz 2B',
      category: 'Escritura',
      currentStock: 5,
      minStock: 15,
      status: 'critical',
    },
    {
      id: 3,
      name: 'Cartulina A4 Colores',
      category: 'Papelería',
      currentStock: 8,
      minStock: 20,
      status: 'low',
    },
    {
      id: 4,
      name: 'Bolígrafo Gel',
      category: 'Escritura',
      currentStock: 12,
      minStock: 25,
      status: 'low',
    },
  ];

  constructor(private router: Router) {}

  navigateToProductDetails(productId: number): void {
    this.router.navigate(['/inventario/productos', productId]);
  }

  navigateToInventory(): void {
    this.router.navigate(['/inventario']);
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
      case 'critical':
        return 'danger';
      case 'low':
        return 'warn';
      default:
        return 'success';
    }
  }

  getStockPercentage(current: number, min: number): number {
    return Math.min(100, (current / min) * 100);
  }
}
