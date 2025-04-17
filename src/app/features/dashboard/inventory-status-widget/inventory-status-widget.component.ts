import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

interface InventoryStat {
  label: string;
  value: string;
  colorClass: string;
}

interface ProductCategory {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-inventory-status-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './inventory-status-widget.component.html',
  styleUrl: './inventory-status-widget.component.css',
})
export class InventoryStatusWidgetComponent {
  inventoryStats: InventoryStat[] = [
    {
      label: 'Total Productos',
      value: '2,456',
      colorClass: 'text-blue-600',
    },
    {
      label: 'Valor de Inventario',
      value: '$245.6M',
      colorClass: 'text-green-600',
    },
    {
      label: 'Rotación Mensual',
      value: '21%',
      colorClass: 'text-purple-600',
    },
  ];

  categories: ProductCategory[] = [
    {
      name: 'Cuadernos',
      count: 587,
      percentage: 24,
      color: 'var(--primary-color)',
    },
    {
      name: 'Escritura',
      count: 452,
      percentage: 18,
      color: 'var(--teal-500)',
    },
    {
      name: 'Papelería',
      count: 390,
      percentage: 16,
      color: 'var(--orange-500)',
    },
    {
      name: 'Escolar',
      count: 328,
      percentage: 13,
      color: 'var(--indigo-500)',
    },
    {
      name: 'Oficina',
      count: 308,
      percentage: 12,
      color: 'var(--blue-500)',
    },
    {
      name: 'Otros',
      count: 391,
      percentage: 17,
      color: 'var(--gray-500)',
    },
  ];

  constructor(private router: Router) {}

  navigateToInventory(): void {
    this.router.navigate(['/inventario']);
  }
}
